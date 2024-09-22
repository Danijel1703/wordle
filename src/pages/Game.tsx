import {
	each,
	find,
	first,
	groupBy,
	map,
	sample,
	size,
	toUpper,
} from "lodash-es";
import React, { useEffect, useReducer, useState } from "react";
import { createPortal } from "react-dom";
import { Keyboard, Letter } from "../components";
import { actionConstants } from "../constants";
import { initializeDailyWord, initializeData, reducer } from "../state";
import { initializeKeyboard } from "../state/initializers";
import { TLetter } from "../types";
import words from "../words";

const word = sample(words) as string;

const defaultState = {
	takes: [],
	letters: [],
	activeLetter: {},
	activeTakeId: "",
	wordGuessed: false,
	error: "",
	dailyWord: [],
};

const dailyWord = initializeDailyWord(word);
const initialData = initializeData(word);
const keyboard = initializeKeyboard();
function Game() {
	const [state, dispatch] = useReducer(reducer, defaultState);
	const [loading, setLoading] = useState(false);
	const groupedLetters = groupBy(state.letters, "takeId");
	const anyTakeSubmitted = find(state.takes, (take) => take.isSubmitted);

	const onChange = (value: string, domId: string | null) => {
		if (loading) return;
		dispatch({
			type: actionConstants.updateLetter,
			payload: {
				value: toUpper(value),
				domId: domId || state.activeLetter.domId,
			},
		});
	};

	const handleDocumentClick = () => {
		const elements = document.getElementsByClassName(
			"input-active"
		) as HTMLCollectionOf<HTMLInputElement>;
		first(elements)?.focus();
	};

	useEffect(() => {
		dispatch({
			type: actionConstants.setData,
			payload: { initialData, dailyWord, word, keyboard, hardMode: false },
		});
		window.addEventListener("click", handleDocumentClick);
		return () => {
			window.removeEventListener("click", handleDocumentClick);
		};
	}, []);

	useEffect(() => {
		state.activeLetter.ref?.current?.focus();
		dispatch({
			type: actionConstants.toggleInputDeleteNext,
			payload: { activeLetter: state.activeLetter },
		});
	}, [state.activeLetter, state.activeLetter.value]);

	useEffect(() => {
		const letters = groupedLetters[state.submittedTakeId];
		state.submittedTakeId && setLoading(true);
		each(letters, (letter: TLetter, index) => {
			let bgColor = "";
			if (letter.consists) {
				bgColor = "yellow";
			} else if (letter.isCorrect) {
				bgColor = "green";
			} else {
				bgColor = "grey";
			}
			setTimeout(() => {
				letter.ref.current?.classList.add("rotate-animation");
				letter.ref.current?.classList.add("text-white");
				letter.ref.current?.classList.add(bgColor);
			}, index * 500);
			setTimeout(() => {
				if (index === size(letters) - 1) {
					setLoading(false);
					dispatch({ type: actionConstants.resetSubmittedTake, payload: null });
					dispatch({
						type: actionConstants.updateKeyboardKeys,
						payload: null,
					});
				}
			}, size(letters) * 500);
		});
	}, [state.submittedTakeId, groupedLetters]);

	useEffect(() => {
		if (state.message) {
			setTimeout(() => {
				dispatch({ type: actionConstants.resetMessage, payload: null });
			}, 2000);
		}
	}, [state.message]);

	const toggleHardMode = () => {
		dispatch({ type: actionConstants.toggleHardMode, payload: null });
	};

	return (
		<React.Fragment>
			<div className="main-wrapper">
				<div className="hard-mode-toggle">
					<p>Hard Mode</p>
					<label className="switch">
						<input
							type="checkbox"
							value={state.hardMode}
							onChange={toggleHardMode}
							disabled={anyTakeSubmitted}
						/>
						<span className="slider round"></span>
					</label>
				</div>

				<div className="words-grid">
					{map(groupedLetters, (letters, takeId) => {
						const take = find(state.takes, (t) => t.id === takeId);
						return (
							<div className="take" id={takeId} key={takeId} ref={take.ref}>
								{map(letters, (letter) => {
									return (
										<Letter
											consists={letter.consists && take.isSubmitted}
											isCorrect={letter.isCorrect && take.isSubmitted}
											isIncorrect={
												!letter.consists &&
												!letter.isCorrect &&
												take.isSubmitted
											}
											ref={letter.ref}
											key={letter.domId}
											value={letter.value}
											domId={letter.domId}
											dispatch={dispatch}
											disabled={state.activeLetter.domId !== letter.domId}
											loading={loading}
											onChange={onChange}
										/>
									);
								})}
							</div>
						);
					})}
				</div>
				<Keyboard onChange={onChange} keyboard={state.keyboard} />
			</div>
			{state.message &&
				createPortal(
					<div className="popup toaster">{state.message}</div>,
					document.body
				)}
		</React.Fragment>
	);
}

export default Game;
