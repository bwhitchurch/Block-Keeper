// shortcuts.js
// Event listener for shortcuts being pressed and menu items
// Block Keeper
// Created by Dallas McNeil

(function() {

    // Recieve shortcuts and perform the acording actions
    require('electron').ipcRenderer.on('shortcut', function(event, message) { 
        if (message === "CommandOrControl+R") {
            events.reloadApp();
        } else if ((events.sessionButtonsShowing() || !globals.menuOpen) && !timer.timerRunning() && message === "CommandOrControl+E") {
            events.toggleSessionButtons();
        } else if (!timer.timerRunning() && !globals.menuOpen) {
            if (message === "CommandOrControl+1") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.recordResultOK();
                events.updateRecords();
            } else if (message === "CommandOrControl+2") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.recordResult2();
                events.updateRecords();
            } else if (message === "CommandOrControl+3") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.recordResultDNF();
                events.updateRecords();
            } else if (message === "CommandOrControl+Backspace") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.deleteRecord();
            } else if (message === "CommandOrControl+N") {
                events.createSession();
                events.setSessionOptions($("#sessionSelect")[0]);
                events.updateRecords();
            } else if (message === "CommandOrControl+S") {
                scramble.scramble();
            } else if (message === "CommandOrControl+T") {
                events.openTimeDialog();
            } else if (message === "CommandOrControl+,") {
                prefs.openPreferences();
            } else if (message === "CommandOrControl+P") {
                if (record.hasVideo() && preferences.recordSolve && !record.recording()) {
                    record.openPreview();
                }
            }
        }
    })
}())