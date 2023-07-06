export const keysConstants = {
  backspace: "BACKSPACE",
  enter: "ENTER",
};

export const allowedKeysConstants = ["BACKSPACE", "ENTER"];

export const actionConstants = {
  setData: "SET_DATA",
  updateLetter: "UPDATE_LETTER",
  toggleInputDeleteNext: "TOGGLE_INPUT_DELETE_NEXT",
  resetSubmittedTake: "RESET_SUBMITTED_TAKE",
  resetMessage: "RESET_MESSAGE",
  updateKeyboardKeys: "UPDATE_KEYBOARD_KEYS",
  toggleHardMode: "TOGGLE_HARD_MODE",
};

export const keyobardKeysConstants: Record<string, Array<string>> = {
  firstRow: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  secondRow: ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  thirdRow: ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
};
