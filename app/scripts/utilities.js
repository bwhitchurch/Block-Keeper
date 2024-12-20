// utilities.js
// General global functions for convenience
// Block Keeper
// Created by Dallas McNeil

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

// Stop zooming in
var webFrame = require('electron').webFrame;
webFrame.setVisualZoomLevelLimits(1, 1);

// Disable a specific element so it cannot be interacted with
function disableElement(elem) {
    $(elem).addClass("disabled");
    $(elem).prop("disabled", true);
    if (timer.timerState() === "inspectReady") {
        timer.cancelTimer();
    }
}

// Enable a specific element to be interacted with
function enableElement(elem) {
    $(elem).removeClass("disabled");
    $(elem).prop("disabled", false);
}

// Disable all major elements, with exception
function disableAllElements(exception = "") {
    var elements = $("#content").children().not("#stats").not("#scramble-container");
    elements = elements.add($("#scramble-container").children());
    elements = elements.add($("#stats").children().not("#session-container"));
    elements = elements.add($("#session-container").children());
    $("#add-time-button").prop("disabled", true);
    $("#add-time-button").addClass("disabled");
    $(".close-tool").prop("disabled", true);
    $(".close-tool").addClass("disabled");
    $(".selectable").prop("disabled", true);
    $(".selectable").addClass("disabled");
    for (var e in elements) {
        if (elements[e].id !== exception && elements[e].id !== undefined) {
            disableElement("#"+elements[e].id);
        }
    }
}

// Deselect any selections
function clearSelection() {
    var sel;
    if ((sel = document.selection) && sel.empty) {
        sel.empty();
    } else {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        var activeEl = document.activeElement;
        if (activeEl) {
            var tagName = activeEl.nodeName.toLowerCase();
            if (tagName == "textarea" || (tagName == "input" && activeEl.type == "text")) {
                 activeEl.selectionStart = activeEl.selectionEnd;
            }
        }
    }
}


// Enable all major elements
function enableAllElements() {
    clearSelection();
    var elements = $("#content").children().not("#stats").not("#scramble-container");
    elements = elements.add($("#scramble-container").children());
    elements = elements.add($("#stats").children().not("#session-container"));
    elements = elements.add($("#session-container").children());
    $("#add-time-button").prop("disabled", false);
    $("#add-time-button").removeClass("disabled");
    $(".close-tool").prop("disabled", false);
    $(".close-tool").removeClass("disabled");
    $(".selectable").prop("disabled", false);
    $(".selectable").removeClass("disabled");
    for (var e in elements) {
        if (elements[e].id === "preview-button") {
            if (record.hasVideo() && preferences.recordSolve && !record.recording()) {
                enableElement("#"+elements[e].id);
            }
        } else {
            enableElement("#"+elements[e].id);
        }
    }
    scramble.updateScramble(); 
}

// Take a time and returns a string taking into account minutes and timer detail
function formatTime(time) {
    if (time === "-") {
        return "-";
    } else if (time === -1) {
        return "DNF";
    }
    let d = Math.pow(10, preferences.timerDetail);
    let t = (Math.floor(time * d) / d);
    if (preferences.formatTime && t >= 60) {
        if (t % 60 < 10) {
            return Math.floor(t / 60) + ":0" + (t % 60).toFixed(preferences.timerDetail);
        } else {
            return Math.floor(t / 60) + ":" + (t % 60).toFixed(preferences.timerDetail);
        }
    } else { 
        return t.toFixed(preferences.timerDetail);
    }
}

function formatAverage(time) {
    if (time === "-") {
        return "-";
    } else if (time === -1) {
        return "DNF";
    }
    let d = Math.pow(10, preferences.timerDetail);
    let t = (Math.round(time * d) / d);
    if (preferences.formatTime && t >= 60) {
        if (t % 60 < 10) {
            return Math.floor(t / 60) + ":0" + (t % 60).toFixed(preferences.timerDetail);
        } else {
            return Math.floor(t / 60) + ":" + (t % 60).toFixed(preferences.timerDetail);
        }
    } else {
        return t.toFixed(preferences.timerDetail);
    }
}

// Returns the standard deviation of a set of times
function standardDeviation(times) {
    var sum = 0;
    var t = removeDNFs(times);
    if (t.length > 1) {
        var mean = meanTimes(t);
        for (var i = 0; i < t.length; i++) {
            sum += ((t[i] - mean) * (t[i] - mean));
        }
        return Math.sqrt(sum / t.length);
    } else {
        return 0;
    }
}

function medianTimes(t) {
    var times = t.slice();

    if (times.length == 0) {
        return 0;
    }
    
    var sortedTimes = times.sort(function(a,b) {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        }
        return 0;
    });

    var a = sortedTimes[Math.ceil((sortedTimes.length - 1) / 2)];
    var b = sortedTimes[Math.floor((sortedTimes.length - 1) / 2)];
    return (a + b) / 2;
}

// Average all the times, DNF's being -1
function averageTimes(times) {
    var t = times.slice();
    if (times.length > 2) {
        t.sort(function(a, b) {
            if (a === -1) {
                return 1;
            } else if (b === -1) {
                return -1;
            } else {
                return a - b;
            }
        })
        t = t.slice(Math.ceil(t.length * 0.05), -Math.ceil(t.length * 0.05));
        if (t[0] == -1) {
            return -1;
        }
    }
    return meanTimes(t);
}

// Get the mean of all times
function meanTimes(times) {
    var sum = 0;
    if (times.length == 0) {
        return 0;
    }
    
    for (var i = 0; i < times.length; i++) {
        sum += times[i];
        if (times[i] === -1) {
            return -1;
        }
    }
    return sum / times.length;
}

// Get the times from records, including +2's and DNF's as -1
function extractTimes(records) {
    var raw = [];
    for (var i = 0; i < records.length; i++) {
        if (records[i].result === "+2") {
            raw.push(records[i].time + 2);
        } else if (records[i].result === "DNF") {
            raw.push(-1);
        } else {
            raw.push(records[i].time);
        }
    }
    return raw;
}

function extractTime(record) {
    if (record.result === "+2") {
        return record.time + 2;
    } else if (record.result === "DNF") {
        return -1;
    } else {
        return record.time;
    }
}

// Format a record, taking into account result
function formatRecord(record) {
    if (record.result === "DNF") {
        return formatTime(-1);
    } else if (record.result === "+2") {
        return formatTime(record.time + 2) + "+";
    } else {
        return formatTime(record.time);
    }
}

// Average the last 'a' records of a list
function averageLastRecords(times, a) {
    if (a > 4) {
        return averageTimes(times.slice(times.length - a));
    } else {
        return meanTimes(times.slice(times.length - a));
    }
}

// Remove DNF's (-1's) from times
function removeDNFs(times) {
    return times.filter(function(a) {return a!=-1;});
}

// Returns the max and min times, the ones removed before an average
function getMinsAndMaxs(times) {
    var t = times.slice();
    t.sort(function(a, b) {
        if (a == -1) {
            return 1;
        } else if (b == -1) {
            return -1;
        } else {
            return a - b;
        }
    });
    if (t.length < 40) {
        return [t[0],t[t.length - 1]];
    } else {
        return t.slice(0, Math.floor(t.length * 0.05)).concat(t.slice(-Math.floor(t.length * 0.05), t.length));
    }
}

// Return a formatted string of splits for an array
function formatSplits(splits) {
    var str = "(";
    var lastSplit = 0;
    for (var i = 0; i < splits.length; i++) {
        str += formatTime(splits[i] - lastSplit);
        lastSplit = splits[i];
        if (i != splits.length - 1) {
            str += " / ";
        }
    }
    str += ")";
    return str;
}
