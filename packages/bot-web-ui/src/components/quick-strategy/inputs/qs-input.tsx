import React from 'react';
import classNames from 'classnames';
import { Field, FieldProps } from 'formik';

import { Input, Popover } from '@deriv/components';

type TQSInput = {
    name: string;
    type?: string;
    fullwidth?: boolean;
    attached?: boolean;
    setFieldValue: (name: string, value: string) => void;
};

const QSInput: React.FC<TQSInput> = ({ type = 'text', fullwidth = false, attached = false, name, setFieldValue }) => {
    const is_number = type === 'number';

    return (
        <Field name={name} key={name} id={name}>
            {({ field, meta }: FieldProps) => {
                const { error, touched } = meta;
                const has_error = error && touched;
                return (
                    <div
                        className={classNames('qs__form__field', {
                            'full-width': fullwidth,
                            'no-top-spacing': attached,
                        })}
                    >
                        <Popover
                            alignment='bottom'
                            message={error}
                            is_open={!!(error && touched)}
                            zIndex='9999'
                            classNameBubble='qs__warning-bubble'
                            has_error
                        >
                            <Input
                                className={classNames('qs__input', { error: has_error })}
                                type={type}
                                leading_icon={
                                    is_number && (
                                        <button onClick={() => setFieldValue?.(name, String(Number(field.value) - 1))}>
                                            -
                                        </button>
                                    )
                                }
                                trailing_icon={
                                    is_number && (
                                        <button onClick={() => setFieldValue?.(name, String(Number(field.value) + 1))}>
                                            +
                                        </button>
                                    )
                                }
                                {...field}
                            />
                        </Popover>
                    </div>
                );
            }}
        </Field>
    );
};

export default QSInput;
