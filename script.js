// 1. Elemente holen
const input = document.getElementById('birthdate');
const customInput = document.getElementById('customDays');
const button = document.getElementById('calculate');
const list = document.getElementById('milestones');
const nameInput = document.getElementById('personName');
const icsButton = document.getElementById('download-ics');
const selectFutureButton = document.getElementById('select-future');
const icsControls = document.getElementById('ics-controls');

// Dark Mode Umschalter
const darkModeBtn = document.getElementById('darkmode-toggle');
if (darkModeBtn) {
  // Beim Laden: Einstellung aus Local Storage übernehmen
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkModeBtn.textContent = '☀️ Helles Design';
  }
  darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkModeBtn.textContent = isDark ? '☀️ Helles Design' : '🌙 Dunkles Design';
    localStorage.setItem('darkMode', isDark);
  });
}

// 2. Funktion zum Berechnen der Meilensteine
function calculateMilestones(dateStr, intervalDays = 1000, count = 30) {
  const birthDate = new Date(dateStr);
  const milestones = [];

  for (let i = 1; i <= count; i++) {
    const days = i * intervalDays;
    const ms = days * 24 * 60 * 60 * 1000;
    const milestoneDate = new Date(birthDate.getTime() + ms);
    milestones.push({ days, date: milestoneDate.toLocaleDateString() });
  }
  return milestones;
}

function calculateAge(birthDate, targetDate) {
  const diff = targetDate - birthDate;
  const age = diff / (365.25 * 24 * 60 * 60 * 1000);
  return age;
}

function formatAge(birthDate, targetDate) {
  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years} Jahre, ${months} Monate`;
}

function getMilestonesData(dateStr, customDays) {
  const milestones = [];
  const today = new Date();
  today.setHours(0,0,0,0);
  if (customDays > 0) {
    const ms = customDays * 24 * 60 * 60 * 1000;
    const milestoneDate = new Date(new Date(dateStr).getTime() + ms);
    if (milestoneDate >= today) {
      milestones.push({ days: customDays, date: milestoneDate });
    }
  } else {
    for (let i = 1; i <= 30; i++) {
      const days = i * 1000;
      const ms = days * 24 * 60 * 60 * 1000;
      const milestoneDate = new Date(new Date(dateStr).getTime() + ms);
      if (milestoneDate >= today) {
        milestones.push({ days, date: milestoneDate });
      }
    }
  }
  return milestones;
}

function downloadICS(events, personName) {
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nCALSCALE:GREGORIAN\r\n';
  events.forEach(ev => {
    const dt = ev.date;
    const dtStart = dt.toISOString().slice(0,10).replace(/-/g, '');
    // DTEND = DTSTART + 1 Tag (Google Kalender erwartet exklusives Enddatum)
    const dtEndDate = new Date(dt.getTime() + 24 * 60 * 60 * 1000);
    const dtEnd = dtEndDate.toISOString().slice(0,10).replace(/-/g, '');
    ics += 'BEGIN:VEVENT\r\n';
    ics += `SUMMARY:${personName} wird ${ev.days} Tage alt.\r\n`;
    ics += `DTSTART;VALUE=DATE:${dtStart}\r\n`;
    ics += `DTEND;VALUE=DATE:${dtEnd}\r\n`;
    ics += 'END:VEVENT\r\n';
  });
  ics += 'END:VCALENDAR';
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'TausenderTage.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// 3. Event-Listener
button.addEventListener('click', () => {
  list.innerHTML = '';
  if (icsControls) icsControls.style.display = 'none';
  const dateStr = input.value;
  if (!dateStr) return;

  // Tabellenkopf erzeugen
  const tableHead = `<thead><tr><th>Export</th><th>Tage</th><th>Datum</th><th>Alter</th></tr></thead>`;
  list.innerHTML = tableHead;

  const today = new Date();
  today.setHours(0,0,0,0);

  const customDays = parseInt(customInput.value);
  let customRow = null;
  if (customDays > 0) {
    const ms = customDays * 24 * 60 * 60 * 1000;
    const milestoneDate = new Date(new Date(dateStr).getTime() + ms);
    const ageStr = formatAge(new Date(dateStr), milestoneDate);
    const isPast = milestoneDate < today;
    customRow = document.createElement('tr');
    if (isPast) customRow.classList.add('past');
    const checkbox = `<input type="checkbox" class="milestone-checkbox" data-days="${customDays}" data-date="${milestoneDate.toISOString()}">`;
    customRow.innerHTML = `<td>${checkbox}</td><td>${customDays}</td><td>${milestoneDate.toLocaleDateString()}</td><td style="text-align:center;">${ageStr}</td>`;
    list.appendChild(customRow);
    // Trennzeile einfügen
    const sepRow = document.createElement('tr');
    sepRow.innerHTML = `<td colspan="4" style="height:10px;background:transparent;"></td>`;
    list.appendChild(sepRow);
  }
  // Tausender-Tage immer anzeigen
  const results = calculateMilestones(dateStr);
  results.forEach(item => {
    // customDays nicht doppelt anzeigen
    if (customDays > 0 && item.days == customDays) return;
    const milestoneDate = new Date(new Date(dateStr).getTime() + item.days * 24 * 60 * 60 * 1000);
    const ageStr = formatAge(new Date(dateStr), milestoneDate);
    const isPast = milestoneDate < today;
    const row = document.createElement('tr');
    if (isPast) row.classList.add('past');
    const checkbox = `<input type="checkbox" class="milestone-checkbox" data-days="${item.days}" data-date="${milestoneDate.toISOString()}">`;
    row.innerHTML = `<td>${checkbox}</td><td>${item.days}</td><td>${item.date}</td><td style="text-align:center;">${ageStr}</td>`;
    list.appendChild(row);
  });
  if (icsControls) icsControls.style.display = 'flex';
});

icsButton.addEventListener('click', () => {
  const dateStr = input.value;
  const personName = nameInput.value || 'Die Person';
  if (!dateStr) return alert('Bitte Geburtsdatum eingeben!');
  const checkboxes = document.querySelectorAll('.milestone-checkbox:checked');
  if (checkboxes.length === 0) {
    alert('Bitte wähle mindestens einen Meilenstein zum Export aus!');
    return;
  }
  const events = Array.from(checkboxes).map(cb => ({
    days: cb.getAttribute('data-days'),
    date: new Date(cb.getAttribute('data-date'))
  }));
  downloadICS(events, personName);
});

if (selectFutureButton) {
  selectFutureButton.addEventListener('change', () => {
    const rows = document.querySelectorAll('.milestone-table tr');
    rows.forEach(row => {
      if (!row.classList.contains('past')) {
        const checkbox = row.querySelector('.milestone-checkbox');
        if (checkbox) checkbox.checked = selectFutureButton.checked;
      }
    });
  });

  // Wenn eine einzelne Checkbox geändert wird, ggf. Haupt-Checkbox zurücksetzen
  document.addEventListener('change', (e) => {
    if (e.target.classList && e.target.classList.contains('milestone-checkbox')) {
      const rows = document.querySelectorAll('.milestone-table tr');
      let allChecked = true;
      rows.forEach(row => {
        if (!row.classList.contains('past')) {
          const checkbox = row.querySelector('.milestone-checkbox');
          if (checkbox && !checkbox.checked) allChecked = false;
        }
      });
      selectFutureButton.checked = allChecked;
    }
  });
}

// Enter in Eingabefeldern löst Berechnen aus
[nameInput, input, customInput].forEach(el => {
  el.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      button.click();
    }
  });
});