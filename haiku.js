var Q = require('q');
function generateNumScheme(maxSyllables) {
    // Maximum number of words given the syllable count
    var numPotentialWords = Math.floor(Math.random() * maxSyllables) + 1;

    // Syllabic structure
    var wordConfig = [];

    // Highest possible syllables in one word
    var max = maxSyllables - numPotentialWords + 1;

    //console.log("Number potential words: " + numPotentialWords);
    //console.log("  Max syllables for one word: " + max)

    while(numPotentialWords > 0) {
      // Generate a random syllable count for the word
      var wordSyllable = Math.floor(Math.random() * max) + 1;

      // Add syllable for the word to the structure
      wordConfig.push(wordSyllable);

      // Decrement maximum number of total syllables by word syllable
      maxSyllables -= wordSyllable;

      // Decrement number of words left
      numPotentialWords--;

      // Decrement the max syllables for one word based on potential words remaining
      max = maxSyllables - numPotentialWords + 1;
    }

    // Add remaining syllables to last element
    if (maxSyllables) {
        wordConfig[wordConfig.length - 1] += maxSyllables;
    }

    return wordConfig;
}

function generateHaiku(dict, scheme) {
  var poem = "";
  scheme.forEach(function(lineScheme, index, arr) {
    var words = lineScheme.map(function(syllableCount) {
       return dict[syllableCount][Math.floor(Math.random() * dict[syllableCount].length)] + " ";
    });
    poem += words.join(" ");
    if (index !== (arr.length - 1)) {
      poem += "\n";
    }
  });
  return poem;
}

function generateSyllabicDict() {
  var deferred = Q.defer();

  var dictionary = {}
  var fs = require("fs");
  // open the cmu dictionary file for "reading" (the little r)
  // cmudict_file = File.open('cmudict.txt', 'r')
  fs.readFile('cmudict.txt', function(err, data) {

    if(err) {
      return console.log(err);
    }
    var lines = data.toString().split("\n");

    // Look through each line of the CMU dictionary
    // and construct a dictionary object with
    // key => the syllableCount
    // value  list of words
    lines.forEach(function(line) {
      var countSyllables = 0;
      var wordEtc = line.split("  ");
      var phonemes = wordEtc[1].split(" ");

      phonemes.forEach(function(phoneme) {
          if(phoneme.match(/\d/)) {
            countSyllables++;
          }
      });

      if (dictionary.hasOwnProperty(countSyllables)) {
        dictionary[countSyllables].push(wordEtc[0]);
      } else {
        dictionary[countSyllables] = [];
      }
    });
    deferred.resolve(dictionary);
  });

  return deferred.promise;
}

var promise = generateSyllabicDict();
promise.then(function(dictionary) {
  //console.log("My dictionary in promise", dictionary);
  var poemScheme = [generateNumScheme(5),
                      generateNumScheme(7),
                      generateNumScheme(5)];
  var poem = generateHaiku(dictionary, poemScheme);

  console.log(poem);
});