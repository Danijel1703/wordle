import {
  filter,
  find,
  first,
  indexOf,
  isEmpty,
  map,
  range,
  sample,
  size,
} from "lodash-es";
import React, {
  ChangeEvent,
  RefObject,
  createRef,
  memo,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import words from "./words";

// type Letter = {
//   id: string;
//   domId: string;
//   value: string;
//   isCorrect: boolean;
//   consists: boolean;
//   ref: RefObject<HTMLInputElement>;
// };

// type DailyWordLetter = {
//   id: string;
//   value: string;
//   letterCount: number;
// };

// type Word = Array<Letter>;

// type Take = {
//   domId: string;
//   word: Word;
//   isSubmitted: boolean;
// };
// const word = sample(words) || "";

// function Game() {
//   const [takes, setTakes] = useState<Array<Take>>([]);
//   const [loading, setLoading] = useState(false);
//   const [dailyWord, setDailyWord] = useState<Array<DailyWordLetter>>([]);
//   const [activeTakeId, setActiveTakeId] = useState<string>("take0");
//   const [activeLetterId, setActiveLetterId] = useState<string>("take0letter0");
//   const [isInitial, setIsInitial] = useState(true);
//   const [displayGigaChadScreen, setDisplayGigaChadScreen] = useState(false);
//   const [revealLetter, setRevealLetter] = useState(false);

//   const handleDocumentClick = () => {
//     const elements = document.getElementsByClassName(
//       "is-active"
//     ) as HTMLCollectionOf<HTMLInputElement>;
//     first(elements)?.focus();
//   };

//   useEffect(() => {
//     onSubmitAction();
//     if (isInitial) {
//       initializeDailyWord();
//       initializeTakes();
//       setIsInitial(false);
//     }
//     window.addEventListener("click", handleDocumentClick);
//     return () => {
//       window.removeEventListener("click", handleDocumentClick);
//     };
//   }, [loading, isInitial]);

//   const initializeDailyWord = () => {
//     const dw = [];
//     for (let i = 0; i < size(word); i++) {
//       const id = "letter" + i;
//       dw.push({
//         id: id,
//         value: word[i],
//         letterCount: filter(word, (l) => l === word[i]).length,
//       });
//     }
//     setDailyWord(dw);
//   };

//   const onChange = (e: KeyboardEvent, letter: Letter, take: Take) => {
//     if (loading) return;
//     let key = e.key;
//     if (key === "Enter") {
//       return onSubmit(take);
//     }
//     const index = indexOf(take.word, letter);
//     const nextLetter = take.word[index + 1];
//     const previousLetter = take.word[index - 1];
//     const isLast = (letter: Letter) =>
//       take.word[indexOf(take.word, letter) + 1] === undefined;
//     setTimeout(() => {
//       if (key !== "Backspace") {
//         key = toUpper(key);
//         if (!nextLetter && !isEmpty(letter.value)) return;
//         if (nextLetter) {
//           setActiveLetterId(nextLetter.domId);
//           nextLetter.ref.current?.focus();
//         }
//         setTakes((oldTakes) => {
//           const newTakes = [...oldTakes];
//           const t = find(oldTakes, (ot) => ot.domId === take.domId);
//           const l = find(t?.word, (ol) => ol.id === letter.id);
//           if (l && l.ref.current) {
//             if (isLast(nextLetter) && !isEmpty(letter.value)) {
//               nextLetter.value = key;
//               if (nextLetter.ref.current) {
//                 nextLetter.ref.current.value = key;
//               }
//             } else {
//               if (isEmpty(letter.value)) {
//                 l.value = key;
//                 l.ref.current.value = key;
//               } else {
//                 nextLetter.value = key;
//                 if (nextLetter.ref.current) {
//                   nextLetter.ref.current.value = key;
//                 }
//               }
//             }
//           }
//           return newTakes;
//         });
//       } else {
//         if (previousLetter) {
//           setActiveLetterId(previousLetter.domId);
//           previousLetter.ref.current?.focus();
//           if (isEmpty(letter.value)) {
//             if (previousLetter.ref.current) {
//               previousLetter.ref.current.value = "";
//               previousLetter.value = "";
//             }
//           }
//         }
//         setTakes((oldTakes) => {
//           const newTakes = [...oldTakes];
//           const t = find(oldTakes, (ot) => ot.domId === take.domId);
//           const l = find(t?.word, (ol) => ol.id === letter.id);
//           if (l && l.ref.current) {
//             l.value = "";
//             l.ref.current.value = "";
//           }
//           return newTakes;
//         });
//       }
//     }, 0);
//   };

//   const onSubmit = (take: Take) => {
//     const nextTake = takes[indexOf(takes, take) + 1];
//     const nextLetter = nextTake?.word[0];
//     const dailyWordCopy = JSON.parse(JSON.stringify(dailyWord));
//     const notEnoughLetters = !every(
//       take.word,
//       (letter) => !isEmpty(letter.value)
//     );
//     const w = map(take.word, (l) => l.value).join("");
//     const invalidWord = !includes(words, w);

//     if (invalidWord || notEnoughLetters) {
//       each(take.word, (l) => {
//         if (l.ref.current) {
//           l.ref.current.classList.add("shake-animation");
//           l.ref.current.classList.remove("input-animation");
//           setTimeout(() => {
//             l.ref.current?.classList.remove("shake-animation");
//           }, 250);
//         }
//       });
//       if (notEnoughLetters) {
//         displayMessage("Not enough letters!");
//       } else {
//         displayMessage("Invalid word!");
//       }
//       return;
//     }
//     each(dailyWordCopy, (letter) => {
//       const correctLetters = filter(
//         take.word,
//         (t) => t.value === letter.value && t.id === letter.id
//       );
//       each(correctLetters, (cl) => {
//         cl.isCorrect = true;
//         const letters = filter(dailyWordCopy, (i) => i.value === letter.value);
//         if (size(letters)) {
//           each(letters, (l) => (l.letterCount = l.letterCount - 1));
//         } else {
//           letter.letterCount = letter.letterCount - 1;
//         }
//       });
//     });

//     each(dailyWordCopy, (letter) => {
//       const guessedLetters = filter(
//         take.word,
//         (t) => t.value === letter.value && t.id !== letter.id
//       );
//       each(guessedLetters, (gl) => {
//         gl.consists = letter.letterCount > 0 && !gl.isCorrect;
//       });
//     });

//     if (nextTake) {
//       setActiveTakeId(nextTake.domId);
//       setActiveLetterId(nextLetter.domId);
//       if (nextLetter.ref.current) {
//         nextLetter.ref.current.disabled = false;
//         nextLetter.ref.current.focus();
//       }
//     } else {
//       last(take.word)?.ref.current?.blur();
//     }
//     take.isSubmitted = true;
//     setTakes([...takes]);
//     setLoading(true);
//   };

//   const onSubmitAction = () => {
//     const submittedTake = last(
//       filter(takes, (take) => take.isSubmitted === true)
//     );
//     each(submittedTake?.word, (letter) => {
//       let bgColor = "";
//       if (letter.consists) {
//         bgColor = "yellow";
//       } else if (letter.isCorrect) {
//         bgColor = "green";
//       } else {
//         bgColor = "grey";
//       }
//       setTimeout(() => {
//         letter.ref.current?.classList.add("text-white");
//         letter.ref.current?.classList.add(bgColor);
//         letter.ref.current?.classList.add("rotate-animation");
//       }, 500 * indexOf(submittedTake?.word, letter) + 1);
//     });
//     setTimeout(() => {
//       if (every(submittedTake?.word, (letter) => letter.isCorrect === true)) {
//         setLoading(false);
//       }
//       if (
//         submittedTake &&
//         every(submittedTake.word, (letter) => letter.isCorrect === true)
//       ) {
//         setDisplayGigaChadScreen(true);
//       }
//     }, 500 * size(submittedTake?.word));
//   };

//   const refresh = () => window.location.reload();

//   return (
//     <div className="main-wrapper">
//       {!displayGigaChadScreen ? (
//         <React.Fragment>
//           <button onClick={() => setRevealLetter(true)}>Show word</button>
//           {revealLetter ? word : ""}
//           {map(takes, (take) => {
//             return (
//               <div id={take.domId} key={take.domId} className="take">
//                 {map(take.word, (letter) => {
//                   return (
//                     <RenderLetter
//                       key={letter.id}
//                       letter={letter}
//                       take={take}
//                       onChange={onChange}
//                       disabled={
//                         activeTakeId !== take.domId ||
//                         activeLetterId !== letter.domId
//                       }
//                     />
//                   );
//                 })}
//               </div>
//             );
//           })}
//         </React.Fragment>
//       ) : (
//         <div className="giga-chad-container">
//           <div className="slide-left-animation">YOU</div>
//           <div className="slide-right-animation">ARE</div>
//           <div className="slide-left-animation-1">GIGA</div>
//           <div className="slide-right-animation-1">CHAD!</div>
//           <u onClick={() => refresh()}>PLAY AGAIN</u>
//         </div>
//       )}
//     </div>
//   );
// }

// type Props = {
//   letter: Letter;
//   onChange: Function;
//   take: Take;
//   disabled: boolean;
// };

// const RenderLetter = ({ letter, onChange, take, disabled }: Props) => {
//   const ignoreKeys = ["Tab", "Alt", "Space", "Control", 32];
//   const allowKeys = ["Enter", "Backspace"];

//   return (
//     <input
//       value={toUpper(letter.value)}
//       id={letter.domId}
//       ref={letter.ref}
//       onKeyDown={(e) => {
//         if (size(e.key) > 1 && !includes(allowKeys, e.key)) return;
//         if (includes(ignoreKeys, e.key) || includes(ignoreKeys, e.keyCode)) {
//           return e.stopPropagation();
//         }
//         onChange(e, letter, take);
//       }}
//       onChange={() => {}}
//       autoFocus={!disabled}
//       tabIndex={-1}
//       className={`
//           letter
//           ${
//             !isEmpty(letter.value) && !take.isSubmitted
//               ? "has-value input-animation"
//               : ""
//           }
//           ${!disabled ? "is-active" : ""}
//           `}
//       style={{
//         pointerEvents: disabled ? "none" : "all",
//       }}
//       maxLength={1}
//     />
//   );
// };

// const displayMessage = (message: string) => {
//   const domElement = document.createElement("div");
//   domElement.className = "toaster";
//   domElement.innerText = message;
//   document.body.appendChild(domElement);
//   setTimeout(() => {
//     document.body.removeChild(domElement);
//   }, 1000);
// };

// export default Game;

const word = sample(words) || "";

type DailyWordLetter = {
  id: string;
  value: string;
  letterCount: number;
};

type Letter = {
  id: string;
  domId: string;
  value: string;
  isCorrect: boolean;
  consists: boolean;
  takeId: string;
  ref: RefObject<HTMLInputElement>;
};

type Word = Array<Letter>;

type Take = {
  id: string;
  domId: string;
  letters: Word;
  isSubmitted: boolean;
};

type Action = {
  type: string;
  payload: Array<Take> | UpdateLetterPayload;
};

type UpdateLetterPayload = {
  value: string;
  letter: Letter;
  onChangeAction: string;
};

type State = {
  takes: Array<Take>;
  letter: Letter;
  activeLetter: Letter;
  activeTake: Take;
};

type LetterProps = {
  letter: Letter;
  onChange: Function;
  disabled: boolean;
};

const initializeDailyWord = () => {
  const letters = range(size(word));
  const dailyWord = map(letters, (letter, index) => {
    const id = "letter" + index;
    return {
      id: id,
      value: word[index],
      letterCount: size(filter(word, (l) => l === word[index])),
    };
  });
  return dailyWord;
};

const initializeTakes = () => {
  const lettersRange = range(size(word));
  const takesRange = range(size(word) + 1);
  const takes: Array<Take> = map(takesRange, (take, index) => {
    const takeId = "take" + index;
    const letters: Array<Letter> = map(lettersRange, (letter, index) => {
      const id = "letter" + index;
      const domId = takeId + "letter" + index;
      return {
        id: id,
        takeId: takeId,
        domId: domId,
        value: "",
        isCorrect: false,
        consists: false,
        ref: createRef(),
      };
    });
    return {
      domId: takeId,
      id: takeId,
      letters: letters,
      isSubmitted: false,
    };
  });
  return takes;
};

const setTakes = (state: State, takes: Array<Take>) => ({
  ...state,
  takes: takes,
  activeTake: first(takes),
  activeLetter: first(first(takes)?.letters),
});

const updateLetter = (
  state: State,
  { letter, onChangeAction }: UpdateLetterPayload
) => {
  const takes = map(state.takes, (take) => {
    if (take.id === letter.takeId) {
      return {
        ...take,
        letters: map(take.letters, (l) => {
          if (l.domId === letter.domId) {
            l.value = letter.value;
            return l;
          }
          return l;
        }),
      };
    }
    return take;
  });
  let activeLetter =
    state.activeTake.letters[
      indexOf(state.activeTake.letters, state.activeLetter) + 1
    ];
  if (isEmpty(activeLetter)) {
    activeLetter = state.activeLetter;
  }
  return { ...state, takes: takes, activeLetter: activeLetter };
};

const actionConstants = {
  setTakes: "SET_TAKES",
  updateLetter: "UPDATE_LETTER",
};

const onChangeActionConstants = {
  next: "NEXT",
  previous: "PREVIOUS",
};

const actions: any = {
  SET_TAKES: setTakes,
  UPDATE_LETTER: updateLetter,
};

const defaultState = {
  takes: [],
  activeLetter: {},
};

function reducer(state: State, action: Action) {
  const actionType: string = action.type;
  const triggerFunc: Function = actions[actionType];
  const defaultState = triggerFunc(state, action.payload);

  switch (actionType) {
    case actionConstants.setTakes:
      return triggerFunc(state, action.payload);
    case actionConstants.updateLetter:
      return triggerFunc(state, action.payload);
    default:
      return defaultState;
  }
}

const dailyWord = initializeDailyWord();
const initialTakes = initializeTakes();
function Game() {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    dispatch({ type: actionConstants.setTakes, payload: initialTakes });
  }, []);

  useEffect(() => {
    state.activeLetter.ref?.current.focus();
  }, [state.activeLetter]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, letter: Letter) => {
      console.log(e);
      dispatch({
        type: actionConstants.updateLetter,
        payload: {
          value: e.target.value,
          letter: letter,
          onChangeAction: onChangeActionConstants.next,
        },
      });
    },
    []
  );

  return (
    <>
      {map(state.takes, (take) => {
        return (
          <div id={take.domId} className="take" key={take.id}>
            {map(take.letters, (letter) => {
              return (
                <RenderLetter
                  onChange={onChange}
                  letter={letter}
                  key={letter.id}
                  disabled={!(state.activeLetter.domId === letter.domId)}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

const RenderLetter = ({ letter, onChange, disabled }: LetterProps) => {
  return (
    <input
      ref={letter.ref}
      type="text"
      id={letter.domId}
      onKeyDown={(e) => onChange(e, letter)}
      maxLength={1}
      disabled={disabled}
    />
  );
};

export default Game;
