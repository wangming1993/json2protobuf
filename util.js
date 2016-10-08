function format(string) {
    if (string.length < 1) return string;

    var words = string.split(/_|-/);

    var formatWord = '';
    words.forEach(function(word) {
        formatWord += word[0].toUpperCase() + word.slice(1);
    });
    return formatWord;
}

var functions = {
    format: format
}

module.exports = functions
