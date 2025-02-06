class Utilities {
    static charToInt(char) {
        return char.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
    }
    static intToChar(num) {
        return String.fromCharCode(num + 'a'.charCodeAt(0) - 1);
    }

}

export default Utilities;