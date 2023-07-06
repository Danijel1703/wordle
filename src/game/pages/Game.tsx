import {
  each,
  find,
  first,
  groupBy,
  isEmpty,
  map,
  sample,
  size,
  toUpper,
} from "lodash-es";
import React, {
  ForwardedRef,
  forwardRef,
  memo,
  useEffect,
  useReducer,
  useState,
} from "react";
import words from "../../words";
import classNames from "classnames";
import { KeyboardKey, Letter, LetterProps } from "../types";
import { createPortal } from "react-dom";
import { initializeDailyWord, initializeData, reducer } from "../state";
import { actionConstants, keysConstants } from "../constants";
import { initializeKeyboard } from "../state/initializers";
import BackspaceIcon from "../../assets/BackspaceIcon";

const word = sample(words) || "REALM";

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
    each(letters, (letter: Letter, index) => {
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
                    <RenderLetter
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
        <div className="keyboard-wrapper">
          {map(state.keyboard, (row: Array<KeyboardKey>) => {
            return (
              <div className={`row-${first(row)?.row}`}>
                {map(row, (item: KeyboardKey) => {
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
      </div>
      {state.message &&
        createPortal(
          <div className="popup toaster">{state.message}</div>,
          document.body
        )}
    </React.Fragment>
  );
}

const RenderLetter = memo(
  forwardRef((props: LetterProps, ref: ForwardedRef<HTMLInputElement>) => {
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

export default Game;
