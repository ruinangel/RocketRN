/**
 * Created by shange on 16/8/10. 输入框 左侧label image图片模块
 *
 * 输入框,在安卓下也可以显示(x)清空按钮
 *
 * inputStyle                       : 输入框的样式
 * placeholder                      : 文字占位符
 * keyboardType                     : 键盘类型('default', 'email-address', 'numeric', 'phone-pad', 'ascii-capable', 'numbers-and-punctuation', 'url', 'number-pad', 'name-phone-pad', 'decimal-pad', 'twitter', 'web-search')
 * maxLength                        : 最大长度
 * autoFocus                        : 默认焦点
 * onChange                         : 文本改变后方法
 * value                            : 文本值
 * underlineColorAndroid            :
 * enablesReturnKeyAutomatically    :
 * clearCallback                    : 执行清空按钮后的回调方法,字符串型,一般用于将按钮置为灰色
 * flagInputCanAccess               : 当前输入  框激活时,是否可以对文本进行复制和粘贴(对大文本输入可能有用)
 * ================================================================================================
 * clearButtonMode                  : 始终是never,统一用按钮处理清空功能
 * ================================================================================================
 * TextInput详解
 *
 * autoCapitalize                   : 枚举类型，可选值有none,sentences,words,characters.当用户输入时，用于提示。
 * placeholder                      : 占位符，在输入前显示的文本内容。
 * value                            : 文本输入框的默认值。
 * placeholdertTextColor            : 占位符文本颜色。
 * secureTextEntry                  : 如果为true ， 则是密码输入框，文本显示为＊＊＊。
 * multiline                        : 如果为true ， 则是多行输入。
 * editable                         : 如果为false ， 文本框不可输入。其默认值是true。
 * autoFocus                        : 如果为true， 将自动聚焦。
 * clearButtonMode                  : 枚举类型，可选值有never，while－enditing , unless-editing,always.用于显示清除按钮。
 * maxLength                        : 能够输入的最长字符数。
 * enablesReturnKeyAutomatically    : 如果值为true，表示没有文本时键盘是不能有返回键的。其默认值为false。
 * returnKeyType                    : 枚举类型，可选值有default,go,google,join,next,route,search,send,yahoo,done,emergency-call。表示软键盘返回键显示的字符串。
 * onChangeText                     : 当文本输入框的内容发生变化时，调用该函数。onChangeText接收一个文本的参数对象。
 * onChange                         : 当文本变化时，调用该函数。
 * onEndEditing                     : 当结束编辑时，调用该函数。
 * onBlur                           : 失去焦点触发事件。
 * onFocus                          : 获得焦点触发事件。
 * onSubmitEditing                  : 当结束编辑后，点击键盘的提交按钮出发该事件。
 */

'use strict';
import React, {Component} from 'react';
import {HFImage, HFConfiguration, HFBaseStyle, TouchableOpacity, View, TextInput, DeviceEventEmitter, StyleSheet} from './../Framework';

import RenderIf from './../Utility/RenderIf';
import UUIDGenerator from 'react-native-uuid-generator';

export default class HFTextInput extends Component {

    static defaultProps = {
        flagImage: false,// 如果有图像,则不能是多行输入
        multiline: false,
        autoFocus: false,
        secureTextEntry: false,
        enablesReturnKeyAutomatically: true,
        flagInputCanAccess: false,// 当前输入框激活时,是否可以对文本进行复制和粘贴(对大文本输入可能有用)
        maxLength: 9999,
        placeholder: '请输入...',
        keyboardType: 'default',
        underlineColorAndroid: 'transparent',
        imageSource: require('./../Image/Icon/phone_green.png'),
    };

    static propTypes = {
        flagImage: React.PropTypes.bool,
        multiline: React.PropTypes.bool,
        autoFocus: React.PropTypes.bool,
        secureTextEntry: React.PropTypes.bool,
        enablesReturnKeyAutomatically: React.PropTypes.bool,
        flagInputCanAccess: React.PropTypes.bool,
        maxLength: React.PropTypes.number,
        placeholder: React.PropTypes.string,
        keyboardType: React.PropTypes.string,
        underlineColorAndroid: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
        let value = this.props.value;
        this.state = {
            isLoading: false,
            error: false,
            iconSource: value && value != null && value != '' ? require('./../Image/Icon/clear.png') : null,
            inputValue: value && value != null && value != '' ? value : '',
            inputLayoutY: 0,
            textInputUUID: null,
            flagInputCanAccess: this.props.flagInputCanAccess,
        };
    }

    componentWillMount() {
        let self = this;
        UUIDGenerator.getRandomUUID().then((uuid) => {
            self.setState({
                textInputUUID: uuid
            });
        });
        // 与键盘扩展区的互动
        this.hfTextInputListener = DeviceEventEmitter.addListener('HFTextInput', function (type, value) {
            if (self.state.flagInputCanAccess && type.indexOf('HFKeyboardSpacer.setContent') == 0) {// 从扩展区粘贴
                let uuid = type.substring('HFKeyboardSpacer.setContent'.length, type.length);
                if (uuid == self.state.textInputUUID) {
                    self.setState({
                        inputValue: self.state.inputValue + value,
                        iconSource: require('./../Image/Icon/clear.png')
                    });
                }
            } else if (self.state.flagInputCanAccess && type == 'HFKeyboardSpacer.getContent') {
                DeviceEventEmitter.emit('HFKeyboardSpacer', 'HFTextInputValue', self.props.secureTextEntry ? null : self.state.inputValue);
            }
        })
    }

    componentWillUnmount() {
        this._listeners.forEach(listener => listener.remove());
        if (this.hfTextInputListener != null) {
            this.hfTextInputListener.remove();
        }
    }

    handlerToggleClear(event) {
        if (this.props.ref) {
            this.refs[this.props.ref].clear();
        } else {
            this.refs['hfTextInput'].clear();
        }
        this.setState({
            inputValue: null,
            iconSource: null
        });
        // 调用父组件的方法
        const {onChange} = this.props;
        if (onChange) {
            onChange(event);
        }
    }

    handlerChange(event) {
        let val = event.nativeEvent.text;
        if (val != null && val.length > 0) {
            this.setState({
                inputValue: val,
                iconSource: require('./../Image/Icon/clear.png')
            });
        } else {
            this.setState({
                inputValue: null,
                iconSource: null
            });
        }
        // 调用父组件的方法
        const {onChange} = this.props;
        if (onChange) {
            onChange(event);
        }
        if (this.state.flagInputCanAccess) {
            // 通知键盘扩展区,可以复制
            DeviceEventEmitter.emit('HFKeyboardSpacer', 'HFTextInputFlagCopy', !this.props.secureTextEntry && val != null && val != '');
        }
    }

    handlerInputFocus(event) {
        // 通知HFPageBody,以将视图滚动到指定高度
        if (HFConfiguration.textInputFocusMarginTop[HFConfiguration.dpiIndex] >= 0) {
            DeviceEventEmitter.emit('HFPageBody', 'HFTextInputScroll', this.state.inputLayoutY - HFConfiguration.textInputFocusMarginTop[HFConfiguration.dpiIndex]);
        }
        // 通知扩展区是否允许复制和粘贴
        DeviceEventEmitter.emit('HFKeyboardSpacer', 'HFTextInputAccess', this.state.flagInputCanAccess);
        //
        if (this.state.flagInputCanAccess) {
            // 通知键盘弹出层,传递当前的组件引用(密码输入框不能复制)
            DeviceEventEmitter.emit('HFKeyboardSpacer', 'HFTextInputUUID', this.state.textInputUUID);
            // 通知键盘扩展区,可以复制
            DeviceEventEmitter.emit('HFKeyboardSpacer', 'HFTextInputFlagCopy', !this.props.secureTextEntry && this.state.inputValue != null && this.state.inputValue != '');
        }
    }

    /**
     * 取得输入框的值
     * 用法 let val = this.refs.inputRef.getValue();
     * @returns {*}
     */
    getValue() {
        return this.state.inputValue;
    }

    render() {
        return (
            <View
                style={[styles.container,HFBaseStyle.textInputView,this.props.style]}
                onLayout={(event)=>{this.setState({inputLayoutY:event.nativeEvent.layout.y})}}
            >
                {RenderIf(this.props.flagImage && !this.props.multiline)(
                    <HFImage
                        style={[styles.image, this.props.imageStyle]}
                        source={this.props.imageSource}
                    />
                )}
                <TextInput
                    ref={this.props.ref||'hfTextInput'}
                    clearButtonMode='never'
                    style={[styles.input,HFBaseStyle.textInput,this.props.inputStyle]}
                    value={this.state.inputValue}
                    multiline={this.props.multiline}
                    placeholder={this.props.placeholder}
                    placeholderTextColor='#cccccc'
                    secureTextEntry={this.props.secureTextEntry}
                    keyboardType={this.props.keyboardType}
                    maxLength={this.props.maxLength}
                    autoFocus={this.props.autoFocus}
                    underlineColorAndroid={this.props.underlineColorAndroid}
                    enablesReturnKeyAutomatically={this.props.enablesReturnKeyAutomatically}
                    onChange={this.handlerChange.bind(this)}
                    onFocus={this.handlerInputFocus.bind(this)}
                />
                <TouchableOpacity style={[styles.button,this.props.iconStyle]}
                                  underlayColor='white'
                                  activeOpacity={0.4}
                                  onPress={this.handlerToggleClear.bind(this)}
                >
                    <HFImage
                        flagNoPlaceholder={true}
                        style={[styles.icon, this.props.iconStyle]}
                        source={this.state.iconSource}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        paddingLeft: 16,
        alignSelf: 'center',
    },
    button: {
        width: 32,
        alignSelf: 'center',
    },
    image: {
        width: 17.5,
        height: 23.5,
        marginLeft: 10,
    },
    icon: {
        width: 16,
        height: 16,
    },
});

module.exports = HFTextInput;