import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useContext,
  CSSProperties,
  ReactNode,
  useState,
} from 'react';
import { Dayjs } from 'dayjs';
import omit from '../../_util/omit';
import { Enter } from '../../_util/keycode';
import { ConfigContext } from '../../ConfigProvider';
import IconClose from '../../../icon/react-icon/IconClose';
import IconHover from '../../_class/icon-hover';
import cs from '../../_util/classNames';
import { isArray } from '../../_util/is';

export interface DateInputProps {
  style?: CSSProperties;
  className?: string | string[];
  error?: boolean;
  status?: 'warning' | 'error';
  disabled?: boolean;
  placeholder?: string;
  value?: Dayjs;
  inputValue?: string;
  popupVisible?: boolean;
  format?: string | ((value: Dayjs) => string);
  prefixCls?: string;
  size?: 'mini' | 'small' | 'default' | 'large';
  allowClear?: boolean;
  onClear?: (e) => void;
  editable?: boolean;
  onPressEnter?: () => void;
  onChange?: (e) => void;
  suffixIcon?: ReactNode;
  isPlaceholder?: boolean;
  prefix?: ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

type DateInputHandle = {
  focus: () => void;
  blur: () => void;
};

function DateInput(
  {
    style,
    className,
    prefixCls: propPrefixCls,
    allowClear,
    status,
    error,
    disabled,
    placeholder,
    format,
    size: propSize,
    onClear,
    editable,
    value,
    inputValue,
    onPressEnter,
    suffixIcon,
    prefix,
    onChange,
    popupVisible,
    isPlaceholder,
    inputProps,
    ...rest
  }: DateInputProps,
  ref
) {
  const { getPrefixCls, size: ctxSize, locale, rtl } = useContext(ConfigContext);
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const size = propSize || ctxSize;
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  useImperativeHandle<any, DateInputHandle>(ref, () => ({
    focus() {
      input.current && input.current.focus && input.current.focus();
    },
    blur() {
      input.current && input.current.blur && input.current.blur();
    },
    getRootDOMNode: () => inputWrapperRef.current,
  }));

  function onKeyDown(e) {
    inputProps?.onKeyDown?.(e);

    const keyCode = e.keyCode || e.which;
    if (keyCode === Enter.code) {
      onPressEnter?.();
    }
  }

  function onChangeInput(e) {
    inputProps?.onChange?.(e);
    onChange?.(e);
  }

  let showValue = '';
  if (inputValue !== undefined) {
    showValue = inputValue;
  } else if (value && !isArray(value)) {
    showValue =
      typeof format === 'function'
        ? format(value)
        : value.locale(locale.dayjsLocale).format(format);
  }

  const readOnlyProps = editable ? {} : { readOnly: true };

  const prefixCls = propPrefixCls || getPrefixCls('picker');

  const inputStatus = status || (error ? 'error' : undefined);
  const mergedFocused = focused || popupVisible;
  const classNames = cs(
    prefixCls,
    `${prefixCls}-size-${size}`,
    {
      [`${prefixCls}-focused`]: mergedFocused,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-has-prefix`]: prefix,
      [`${prefixCls}-${inputStatus}`]: inputStatus,
      [`${prefixCls}-rtl`]: rtl,
    },
    className
  );

  return (
    <div
      style={style}
      className={classNames}
      ref={inputWrapperRef}
      {...omit(rest, ['onChange', 'onPressEnter'])}
    >
      {prefix && <div className={`${prefixCls}-prefix`}>{prefix}</div>}
      <div
        className={cs(`${prefixCls}-input`, { [`${prefixCls}-input-placeholder`]: isPlaceholder })}
      >
        <input
          ref={input}
          {...inputProps}
          disabled={disabled}
          placeholder={placeholder}
          className={`${prefixCls}-start-time`}
          value={showValue}
          onKeyDown={onKeyDown}
          onChange={onChangeInput}
          {...readOnlyProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps?.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps?.onBlur?.(e);
          }}
        />
      </div>
      <div className={`${prefixCls}-suffix`}>
        {allowClear && showValue && (
          <IconHover prefix={prefixCls} onClick={onClear} className={`${prefixCls}-clear-icon`}>
            <IconClose />
          </IconHover>
        )}
        <span className={`${prefixCls}-suffix-icon`}>{suffixIcon}</span>
      </div>
    </div>
  );
}

export default forwardRef<DateInputHandle, DateInputProps>(DateInput);
