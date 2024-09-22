import { first, map, size } from "lodash-es";
import { TKeyboard, TKeyboardKey } from "../types";
import BackspaceIcon from "../assets/BackspaceIcon";
import { keysConstants } from "../constants";

const Keyboard = ({
	keyboard,
	onChange,
}: {
	keyboard: TKeyboard;
	onChange: Function;
}) => {
	return (
		<div className="keyboard-wrapper">
			{map(keyboard, (row: Array<TKeyboardKey>) => {
				return (
					<div className={`row-${first(row)?.row}`}>
						{map(row, (item: TKeyboardKey) => {
							let keyColor = "neutral";
							if (item.isCorrect) {
								keyColor = "green-key";
							} else if (item.consists) {
								keyColor = "yellow-key";
							} else if (
								!item.consists &&
								!item.isCorrect &&
								item.isSubmitted
							) {
								keyColor = "grey-key";
							}
							return (
								<div
									className={`row-${item.row}-item font-${size(
										item.value
									)} ${keyColor}`}
									style={{ cursor: "pointer" }}
									onClick={() => onChange(item.value, null)}
								>
									{item.value !== keysConstants.backspace ? (
										item.value
									) : (
										<BackspaceIcon />
									)}
								</div>
							);
						})}
					</div>
				);
			})}
		</div>
	);
};

export default Keyboard;
