import { ForwardedRef, forwardRef, memo } from "react";
import { TLetterProps } from "../types";
import { isEmpty, toUpper } from "lodash-es";
import classNames from "classnames";

const Letter = memo(
	forwardRef((props: TLetterProps, ref: ForwardedRef<HTMLInputElement>) => {
		const {
			value,
			domId,
			disabled,
			isCorrect,
			consists,
			isIncorrect,
			onChange,
		} = props;
		const isSubmitted = isCorrect || consists || isIncorrect;
		const showBorder = !isSubmitted && !isEmpty(value);
		const toggleAnimation = !isEmpty(value);

		const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			onChange(toUpper(e.key), domId);
		};

		return (
			<input
				ref={ref}
				value={value}
				type="text"
				tabIndex={-1}
				maxLength={1}
				onKeyDown={onKeyDown}
				className={classNames("letter", {
					"input-animation": toggleAnimation,
					"input-active": !disabled,
					disabled: disabled,
					"letter-border": showBorder,
				})}
				autoFocus={!disabled}
				readOnly
			/>
		);
	})
);

export default Letter;
