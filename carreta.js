function show_index(neb_report) {
    var words_per_sentence;
    if (neb_report.total_sentences == 0) {
        words_per_sentence = 0;
    } else {
        words_per_sentence = (neb_report.total_words) / neb_report.total_sentences;
    }
    var longwordidx = neb_report.long_words.length * 100.0 / neb_report.total_words;
    if (neb_report.total_words == 0) {
        longwordidx = 0;
    } else {
        longwordidx = neb_report.long_words.length * 100.0 / neb_report.total_words;
    }
    var nebidx = 0.4 * (words_per_sentence + longwordidx);

    document.getElementById("oraciones").innerHTML = String(neb_report.total_sentences);
    document.getElementById("palabras").innerHTML = String(neb_report.total_words);
    document.getElementById("largas").innerHTML = String(neb_report.long_words.length);
    document.getElementById("pal_por_orac").innerHTML = String(words_per_sentence);
    document.getElementById("indice").innerHTML = "<strong>" + String(nebidx) + "</strong>";
}

function show_annotated_text(text, long_words) {
    long_words.forEach(function(lword) {
        text = text.replace(RegExp("(" + lword + ")", "gi"), "<span class=\"longword\">$1</span>");
    });
    var pars = text.split(/\s*\n\s*\n\s*/).map(function (par) {return "<p>" + par + "</p>"});
    document.getElementById("subrayado").innerHTML = pars.reduce(function(allpars, par) {return allpars + par;}, "");
}

function measure_nebulosity() {
    var text_to_check = document.getElementById('lacarreta').value;

    var neb_report = _measure_nebulosity(text_to_check);
    show_index(neb_report);
    show_annotated_text(text_to_check, neb_report.long_words);
    console.log(neb_report);
    return neb_report;
}

function remove_nonalnum(text) {
    text = text.replace("/", " ");
    var r = /[^a-zA-Z0-9ñÑáÁéÉíÍóÓúÚüÜ\n -]/g;
    return text.replace(r, "");
}

function detect_proper_nouns(sentence) {
    // simple definition for proper noun: anything capitalized that is not at
    // the beggining of a sentence
    var r = / ([A-ZÁÉÍÓÚÜÑ][a-záéíóúü]+)/g;
    var nouns = sentence.match(r);
    if (!nouns) {
        return [];
    }
    return nouns.map(function(noun) {return noun.trim()});
}

function _measure_nebulosity(text) {
    var report = {};
    var sentences = get_sentences(text).map(remove_nonalnum);
    var proper_nouns = [].concat.apply(
        [], sentences.map(detect_proper_nouns)
    ).reduce(function(obj, noun) {
        obj[noun] = 1;
        return obj;
    }, {});

    var all_words = sentences.reduce(function (curr_list, sentence) {
        var as_arr = sentence.trim().split(/\s+/g);
        return curr_list.concat(as_arr);
    }, []);

    var long_words = all_words.filter(function(word) {
        return vowel_groups(word) >= 4 && proper_nouns[word] !== 1;
    });

    report.total_sentences = sentences.length;
    report.total_words = all_words.length;
    report.long_words = long_words;

    return report;
}

function vowel_groups(word) {
    if (word.length == 0) {
        return 0;
    }
    var vg = /[aAeEiIoOuUáÁéÉíÍóÓúÚüÜ]+/g ;
    var groups = word.split(vg);
    if (groups.length == 1) {
        return 1;
    }

    return groups.length - 1;
}

function get_sentences(text) {
    var r = /\?|\. |!/ ;
    var sns = text.split(r);
    if (sns[sns.length - 1].trim().length == 0) { // text ends on a sentence separator
        sns.pop();
    }
    return sns;
}

// Bienvenido de vuelta, Monsieur Derrida.
// Ni la NSA es capaz de entender este texto.
//
// Este texto es lo suficientemente sencillo para Simón Gaviria.
