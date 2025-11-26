let currentMenu = $('.homepage');

$('.column button .card').on('click', function () {
    let nextMenu = this.getAttribute('data');

    if (nextMenu === 'proxy') {
        if (!config['proxy']) {
            $('#disabled').showModal();
            return;
        }
        $('#everything-else').fadeOut(300, () => {
            $('#page-loader').fadeIn(200);
$('#page-loader iframe').attr('src', 'https://auth.teaching.za.com/indev');
            alert('When you are trying to google something, use start.duckduckgo.com as an alternative to google since google search is broken. When you are using duckduckgo, use the textbox in the duckduckgo site'); 
            alert('List of services that dont work: (may not list all, please contact owner if you find one):\nNow.gg\nGoogle (any services that relate to google)\nRoblox\nYoutube'); 
            $('#page-loader iframe')[0].focus();
        });
        currentMenu = $('#page-loader');
        inGame = !preferences.background; // if background is disabled (false) then inGame is set to to true turning off the background
        return;
    }

    currentMenu.fadeOut(300, () => {
        $('.' + nextMenu).fadeIn(200);
    });
    currentMenu = $('.' + nextMenu);
});

$('logo img').on('click', returnHome);
$('#gameButton').on('click', returnHome);
$('#refresh').on('click', refreshPage);

$('dialog').on('click', function (e) {
    if (!e.originalEvent.target.closest('div')) {
        e.originalEvent.target.close();
    }
});

// Function to calculate the
// Jaro Similarity of two strings
// from https://www.geeksforgeeks.org/jaro-and-jaro-winkler-similarity/
function jaro_distance(s1, s2) {
    // If the strings are equal
    if (s1 == s2) return 1.0;

    // Length of two strings
    let len1 = s1.length,
        len2 = s2.length;

    if (len1 == 0 || len2 == 0) return 0.0;

    // Maximum distance upto which matching
    // is allowed
    let max_dist = Math.floor(Math.max(len1, len2) / 2) - 1;

    // Count of matches
    let match = 0;

    // Hash for matches
    let hash_s1 = new Array(s1.length);
    hash_s1.fill(0);
    let hash_s2 = new Array(s2.length);
    hash_s2.fill(0);

    // Traverse through the first string
    for (let i = 0; i < len1; i++) {
        // Check if there is any matches
        for (let j = Math.max(0, i - max_dist); j < Math.min(len2, i + max_dist + 1); j++)
            // If there is a match
            if (s1[i] == s2[j] && hash_s2[j] == 0) {
                hash_s1[i] = 1;
                hash_s2[j] = 1;
                match++;
                break;
            }
    }

    // If there is no match
    if (match == 0) return 0.0;

    // Number of transpositions
    let t = 0;

    let point = 0;

    // Count number of occurrences
    // where two characters match but
    // there is a third matched character
    // in between the indices
    for (let i = 0; i < len1; i++)
        if (hash_s1[i] == 1) {
            // Find the next matched character
            // in second string
            while (hash_s2[point] == 0) point++;

            if (s1[i] != s2[point++]) t++;
        }
    t /= 2;

    // Return the Jaro Similarity
    return (match / len1 + match / len2 + (match - t) / match) / 3.0;
}

// Jaro Winkler Similarity
function jaroWinklerSimilarity(s1, s2) {
    let jaro_dist = jaro_distance(s1, s2);

    // If the jaro Similarity is above a threshold
    if (jaro_dist > 0.7) {
        // Find the length of common prefix
        let prefix = 0;

        for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
            // If the characters match
            if (s1[i] == s2[i]) prefix++;
            // Else break
            else break;
        }

        // Maximum of 4 characters are allowed in prefix
        prefix = Math.min(4, prefix);

        // Calculate jaro winkler Similarity
        jaro_dist += 0.1 * prefix * (1 - jaro_dist);
    }
    return jaro_dist.toFixed(6);
}

/**
 * Updates the list of games based on the current search filter and sort type.
 *
 * @return {void}
 */
function updateList() {
    const filter = $('#search').val().toLowerCase();
    const elems = Array.from(document.querySelectorAll('#gamesList li'));
    const sortType = $('#sort').val();

    // sort by selected sort type
    elems.sort(function (a, b) {
        if (sortType === 'alphabetical') {
            return a.textContent.localeCompare(b.textContent);
        } else if (sortType === 'reverse') {
            return b.textContent.localeCompare(a.textContent);
        }
    });

    // then filter items with the search input
    elems.forEach(function (item) {
        let similarity = jaroWinklerSimilarity(filter, item.innerHTML.toLowerCase().slice(0, filter.length - 1));
        if (item.getAttribute('aliases')) {
            for (alias in item.getAttribute('aliases').split(',')) {
                if (alias.length > 1) {
                    console.log('alias');
                    console.log(alias);
                    console.log(typeof alias);
                    console.log(alias.length);
                    similarity += jaroWinklerSimilarity(filter, alias.toLowerCase().slice(0, filter.length - 1));
                }
            }
        }

        if ((similarity >= 0.7 && item.innerHTML.length > 2) || item.innerHTML.toLowerCase().indexOf(filter) > -1) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    // now sort by jaro winkler distance
    elems.sort(function (a, b) {
        let distanceA = jaroWinklerSimilarity(filter, a.textContent.toLowerCase());
        if (a.getAttribute('aliases')) {
            for (alias in a.getAttribute('aliases').split(',')) {
                distanceA += jaroWinklerSimilarity(filter, alias.toLowerCase());
            }
        }

        let distanceB = jaroWinklerSimilarity(filter, b.textContent.toLowerCase());
        if (b.getAttribute('aliases')) {
            for (alias in b.getAttribute('aliases').split(',')) {
                distanceB += jaroWinklerSimilarity(filter, alias.toLowerCase());
            }
        }
        return distanceA - distanceB;
    });

    // then fill it with the sorted and filtered list
    for (const item of elems) {
        document.getElementById('gamesList').appendChild(item);
        updateGameList();
    }
}
$('#search').on('input', updateList);
$('#sort').on('change', updateList);

dragElement(document.getElementById('gameButton'));
dragElement(document.getElementById('refresh'));

const sequences = [
    { keys: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA', 'Enter'], action: () => alert('No easter egg here') },
    { keys: ['KeyL', 'KeyE', 'KeyT', 'Space', 'KeyI', 'KeyT', 'Space', 'KeyS', 'KeyN', 'KeyO', 'KeyW'], action: snow },
  ];

  let index = 0;

  document.addEventListener('keydown', (event) => {
      var failed = true;
      for (const sequence of sequences) {
          if (event.code === sequence.keys[index]) {
              failed = false;
              index++;

              if (index === sequence.keys.length) {
                  sequence.action();
                  index = 0;
              }
          } else if (event.code === sequence.keys[0]) {
              failed = false;
              index = 1;
          }
      }
      if (failed) {
          index = 0;
      }
  });

  function snow() {
      function i() {
          this.D = function () {
              const t = h.atan(this.i / this.d);
              l.save(),
                  l.translate(this.b, this.a),
                  l.rotate(-t),
                  l.scale(this.e, this.e * h.max(1, h.pow(this.j, 0.7) / 15)),
                  l.drawImage(m, -v / 2, -v / 2),
                  l.restore();
          };
      }
      window;
      const h = Math,
          r = h.random,
          a = document,
          o = Date.now;
      (e = (t) => {
          l.clearRect(0, 0, _, f), l.fill(), requestAnimationFrame(e);
          const i = 0.001 * y.et;
          y.r();
          const s = L.et * g;
          for (var n = 0; n < C.length; ++n) {
              const t = C[n];
              (t.i = h.sin(s + t.g) * t.h),
                  (t.j = h.sqrt(t.i * t.i + t.f)),
                  (t.a += t.d * i),
                  (t.b += t.i * i),
                  t.a > w && (t.a = -u),
                  t.b > b && (t.b = -u),
                  t.b < -u && (t.b = b),
                  t.D();
          }
      }),
          (s = (t) => {
              for (var e = 0; e < p; ++e) (C[e].a = r() * (f + u)), (C[e].b = r() * _);
          }),
          (n = (t) => {
              (c.width = _ = innerWidth), (c.height = f = innerHeight), (w = f + u), (b = _ + u), s();
          });
      class d {
          constructor(t, e = !0) {
              (this._ts = o()), (this._p = !0), (this._pa = o()), (this.d = t), e && this.s();
          }
          get et() {
              return this.ip ? this._pa - this._ts : o() - this._ts;
          }
          get rt() {
              return h.max(0, this.d - this.et);
          }
          get ip() {
              return this._p;
          }
          get ic() {
              return this.et >= this.d;
          }
          s() {
              return (this._ts = o() - this.et), (this._p = !1), this;
          }
          r() {
              return (this._pa = this._ts = o()), this;
          }
          p() {
              return (this._p = !0), (this._pa = o()), this;
          }
          st() {
              return (this._p = !0), this;
          }
      }
      const c = a.createElement('canvas');
      (H = c.style),
          (H.position = 'fixed'),
          (H.left = 0),
          (H.top = 0),
          (H.width = '100vw'),
          (H.height = '100vh'),
          (H.zIndex = '100000'),
          (H.pointerEvents = 'none'),
          a.body.insertBefore(c, a.body.children[0]);
      const l = c.getContext('2d'),
          p = 300,
          g = 5e-4,
          u = 20;
      let _ = (c.width = innerWidth),
          f = (c.height = innerHeight),
          w = f + u,
          b = _ + u;
      const v = 15.2,
          m = a.createElement('canvas'),
          E = m.getContext('2d'),
          x = E.createRadialGradient(7.6, 7.6, 0, 7.6, 7.6, 7.6);
      x.addColorStop(0, 'hsla(255,255%,255%,1)'),
          x.addColorStop(1, 'hsla(255,255%,255%,0)'),
          (E.fillStyle = x),
          E.fillRect(0, 0, v, v);
      let y = new d(0, !0),
          C = [],
          L = new d(0, !0);
      for (var j = 0; j < p; ++j) {
          const t = new i();
          (t.a = r() * (f + u)),
              (t.b = r() * _),
              (t.c = 1 * (3 * r() + 0.8)),
              (t.d = 0.1 * h.pow(t.c, 2.5) * 50 * (2 * r() + 1)),
              (t.d = t.d < 65 ? 65 : t.d),
              (t.e = t.c / 7.6),
              (t.f = t.d * t.d),
              (t.g = (r() * h.PI) / 1.3),
              (t.h = 15 * t.c),
              (t.i = 0),
              (t.j = 0),
              C.push(t);
      }
      s(), (EL = a.addEventListener), EL('visibilitychange', () => setTimeout(n, 100), !1), EL('resize', n, !1), e();
  }

  /**
   * Adds drag functionality to an HTML element.
   *
   * @param {HTMLElement} elmnt - The element to be dragged.
   * @return {void}
   */
  function dragElement(elmnt) {
      var pos1 = 0,
          pos2 = 0,
          pos3 = 0,
          pos4 = 0;
      if (document.getElementById(elmnt.id)) {
          document.getElementById(elmnt.id).onmousedown = dragMouseDown;
      } else {
          elmnt.onmousedown = dragMouseDown;
      }

      function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();

          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          window.click = 1;
          elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
      }

      function closeDragElement() {
          document.onmouseup = null;
          document.onmousemove = null;

          if (window.click == 1) {
              window.hold = true;
              window.click = 0;
          }
          setTimeout(function () {
              window.hold = false;
          }, 100);
      }
  }

  /**
   * Returns the user to the home page.
   *
   * @return {void}
   */
  function returnHome() {
      currentMenu.fadeOut(300, () => {
          $('#everything-else').fadeIn(200);
          $('.games').hide();
          $('.homepage').fadeIn(200);
      });
      currentMenu = $('.homepage');
      inGame = !preferences.background; // if background is disabled (false) then inGame is set to to true turning off the background
  }

  /**
function toggleStar(event, star) {
    event.preventDefault();
    event.stopPropagation();
    star.classList.toggle('filled');
}
 * Refreshes the current page by reloading it.
 *
 * @return {void}
 */
  function refreshPage() {
      const oldUrl = $('#page-loader iframe').attr('src');
      console.log(oldUrl);
      $('#page-loader iframe').attr('src', '');

      // delay is needed for some reason
      setTimeout(() => {
          $('#page-loader iframe').attr('src', oldUrl);
      }, 10);
  }

  /**
   * Generates a clone of the current window in an about:blank.
   *
   * @return {void}
   */
  function makecloak(replaceUrl = preferences.cloakUrl) {
      if (window.top.location.href !== 'about:blank') {
          var url = window.location.href;
          const win = window.open();
          if (!win || win.closed || typeof win.closed == 'undefined') {
              return;
          }
          win.document.body.style.margin = '0';
          win.document.body.style.height = '100vh';
          var iframe = win.document.createElement('iframe');
          iframe.style.border = 'none';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.margin = '0';
          iframe.referrerpolicy = 'no-referrer';
          iframe.allow = 'fullscreen';
          iframe.src = url.toString();
          win.document.body.appendChild(iframe);
          window.location.replace(replaceUrl);
      }
  }

  /**
   * Changes the browser tab's title and favicon
   *
   * @return {void}
   */
  function mask(title = preferences.maskTitle, iconUrl = preferences.maskIconUrl) {
      const e = window.top.document;
      e.title = title;
      var link = e.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = iconUrl;
      e.getElementsByTagName('head')[0].appendChild(link);
  }

  function popupsAllowed() {
      var windowName = 'userConsole';
      var popUp = window.open(
          '/popup-page.php',
          windowName,
          'width=1000, height=700, left=24, top=24, scrollbars, resizable'
      );
      if (popUp == null || typeof popUp == 'undefined') {
          return false;
      } else {
          popUp.close();
          return true;
      }
  }

  // Function to mute or unmute all sounds
  function toggleMute() {
      // cant find working code rn
  }

  function getMainSave() {
      var mainSave = {};

      localStorageSave = Object.entries(localStorage);

      localStorageSave = btoa(JSON.stringify(localStorageSave));

      mainSave.localStorage = localStorageSave;

      cookiesSave = document.cookie;

      cookiesSave = btoa(cookiesSave);

      mainSave.cookies = cookiesSave;

      mainSave = btoa(JSON.stringify(mainSave));

      mainSave = CryptoJS.AES.encrypt(mainSave, 'save').toString();

      return mainSave;
  }

  function downloadMainSave() {
      var data = new Blob([getMainSave()]);
      var dataURL = URL.createObjectURL(data);

      var fakeElement = document.createElement('a');
      fakeElement.href = dataURL;
      fakeElement.download = 'monkey.data';
      fakeElement.click();
      URL.revokeObjectURL(dataURL);
  }

  function getMainSaveFromUpload(data) {
      data = CryptoJS.AES.decrypt(data, 'save').toString(CryptoJS.enc.Utf8);

      var mainSave = JSON.parse(atob(data));
      var mainLocalStorageSave = JSON.parse(atob(mainSave.localStorage));
      var cookiesSave = atob(mainSave.cookies);

      for (let item in mainLocalStorageSave) {
          localStorage.setItem(mainLocalStorageSave[item][0], mainLocalStorageSave[item][1]);
      }

      document.cookie = cookiesSave;
  }

  function uploadMainSave() {
      var hiddenUpload = document.createElement('input');
      hiddenUpload.type = 'file';
      hiddenUpload.accept = '.data';
      document.body.appendChild(hiddenUpload);
      hiddenUpload.click();

      hiddenUpload.addEventListener('change', function (e) {
          var files = e.target.files;
          var file = files[0];

          if (!file) {
              return;
          }

          var reader = new FileReader();

          reader.onload = function (e) {
              getMainSaveFromUpload(e.target.result);

              var uploadResult = document.querySelector('.upload-result');
              uploadResult.innerText = 'Uploaded save!';
              setTimeout(function () {
                  uploadResult.innerText = '';
              }, 3000);
          };

          reader.readAsText(file);

          document.body.removeChild(hiddenUpload);
      });
  }

  const keyConfig = JSON.parse(localStorage.getItem('keyConfig')) || {};
  const keySlots = document.querySelectorAll('.keySlot');
  const actions = document.querySelectorAll('.slot-action');

  for (var slot in keyConfig) {
      if (keyConfig.hasOwnProperty(slot)) {
          for (var key in keyConfig[slot]) {
              if (keyConfig[slot].hasOwnProperty(key)) {
                  var correctKey = keyConfig[slot][key];
                  var slotDiv = document.getElementById(slot);
                  if (slotDiv) {
                      if (key.includes('keySlot')) {
                          key = key.replace(/-/g, ' ');
                      }
                      var keyElement = slotDiv.getElementsByClassName(key)[0];
                      if (keyElement) {
                          if (key != 'slot-action') {
                              keyElement.textContent = correctKey;
                          } else {
                              for (var i = 0; i < keyElement.options.length; i++) {
                                  if (keyElement.options[i].value === correctKey) {
                                      keyElement.selectedIndex = i;
                                      break;
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }
  }


actions.forEach((action) => {
    action.addEventListener('change', () => {
        slot = action.parentNode.id;
        if (!keyConfig[slot]) {
            keyConfig[slot] = {};
        }
        keyConfig[slot]["slot-action"] = action.value;
        localStorage.setItem('keyConfig', JSON.stringify(keyConfig));
    });
});

keySlots.forEach((slot) => {
    slot.addEventListener('click', () => {
        slot.textContent = 'Press any key';

        // Add a one-time event listener to capture the key press
        const keyPressHandler = (event) => {
            slot.textContent = event.key;
            document.removeEventListener('keydown', keyPressHandler);
            parSlot = event.target.parentNode.id;
            if (!keyConfig[parSlot]) {
                keyConfig[parSlot] = {};
            }
            key = event.target.className.replace(/ /g, "-");
            keyConfig[parSlot ][key] = event.key;
            localStorage.setItem('keyConfig', JSON.stringify(keyConfig));
        };

        document.addEventListener('keydown', keyPressHandler);
    });
});

var pressedKeys = {};


function onKeyRelease(event) {
    var key = event.key.toLowerCase();
    pressedKeys[key] = false;
}

function onKeyPress(event) {
    var key = event.key.toLowerCase();
    pressedKeys[key] = true
    for (var slot in keyConfig) {
      if (keyConfig.hasOwnProperty(slot)) {
        // Check if the slot has configurations for key-1, key-2, and action
        if (
          keyConfig[slot]["keySlot-1"] &&
          keyConfig[slot]["keySlot-1"] &&
          keyConfig[slot]["slot-action"]
        ) {
          // Check if the pressed keys match the configured keys
          var keyPressed = event.key.toLowerCase();
          var key1Config = keyConfig[slot]["keySlot-1"].toLowerCase();
          var key2Config = keyConfig[slot]["keySlot-2"].toLowerCase();
          var key3Config = (keyConfig[slot]["keySlot-3"] || "").toLowerCase(); //  case where key-3 might not exist
          if (pressedKeys[key1Config] && pressedKeys[key2Config] && ((key3Config) ? pressedKeys[key3Config] : true)) {
            eval(keyConfig[slot]["slot-action"]);
          }
        }
      }
    }
  }

document.addEventListener('keydown', onKeyPress);
document.addEventListener('keyup', onKeyRelease);

const defaultColorSettings = {
    bg: '#202020',
    'block-color': '#2b2b2b',
    'button-color': '#373737',
    'games-color': '#373737a6',
    'hover-color': '#3c3c3c',
    'scrollbar-color': '#434343',
    'scroll-track-color': '#111',
    'font-color': '#dcddde',
};

const colorSettings = JSON.parse(localStorage.getItem('colorSettings')) || defaultColorSettings;

// Set input values
Object.keys(colorSettings).forEach((key) => {
    const inputElement = document.getElementById(key);
    if (inputElement) {
        inputElement.value = colorSettings[key];
    }
});

// Set CSS variables
Object.entries(colorSettings).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
});

// Save changes button event listener
function saveColorChanges() {
    const inputs = document.querySelectorAll('input[type="color"]');
    const newColorSettings = {};

    inputs.forEach((input) => {
        newColorSettings[input.id] = input.value;
    });

    // Save to local storage
    localStorage.setItem('colorSettings', JSON.stringify(newColorSettings));

    // Set CSS variables
    Object.entries(newColorSettings).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
    });
}

// Restore defaults button event listener
function restoreColorChanges() {
    // Reset to default values
    localStorage.removeItem('colorSettings');

    // Set CSS variables
    Object.entries(colorSettings).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
    });
}

function randomGame() {
    const gameLinks = document.querySelectorAll('#gamesList li');
    const randomIndex = Math.floor(Math.random() * gameLinks.length);
    const randomGameLink = gameLinks[randomIndex];
    // window.location.href = randomGameLink.getAttribute('url');
    const url = randomGameLink.getAttribute('url');
    inGame = true;
    $('#everything-else').fadeOut();
    $('#page-loader').fadeIn();
    $('#page-loader iframe').attr('src', url);
    $('#page-loader iframe')[0].focus();
    currentMenu = $('#page-loader');
}

const preferencesDefaults = {
    cloak: true,
    cloakUrl: 'https://classroom.google.com',
    mask: true,
    maskTitle: 'Home',
    maskIconUrl: 'https://ssl.gstatic.com/classroom/favicon.ico',
    background: true,
};

if (localStorage.getItem('preferences') == null) {
    localStorage.setItem('preferences', JSON.stringify(preferencesDefaults));
}
const preferences = JSON.parse(localStorage.getItem('preferences'));
const cloakCheckbox = document.getElementById('cloakCheckboxInput');
const backgroundCheckbox = document.getElementById('backgroundCheckboxInput');
const cloakUrl = document.getElementById('cloakUrlInput');
const maskCheckbox = document.getElementById('maskCheckboxInput');
const maskTitle = document.getElementById('maskTitleInput');
const maskIcon = document.getElementById('maskIconInput');
cloakCheckbox.checked = preferences.cloak;
cloakUrl.value = preferences.cloakUrl;
maskCheckbox.checked = preferences.mask;
maskTitle.value = preferences.maskTitle;
maskIcon.value = preferences.maskIconUrl;
backgroundCheckbox.checked = preferences.background;

const presets = {
    classroom: {
        url: 'https://classroom.google.com/',
        title: 'Home',
        icon: 'https://ssl.gstatic.com/classroom/favicon.ico',
    },
    drive: {
        url: 'https://drive.google.com/',
        title: 'My Drive - Google Drive',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAB+klEQVR4AWJwL/ChKx68ForXW7SJN1iswYb5GyxaqGqhycrgR+rTAKzUA2hoURwG8Cn3bL/wbNuIz7Y5p9kOY57NMBvZs23bPtt/dW7b4VR94ep3v6OHaJvFJSoaZldQROB+hDJValcFPBj20vB82AsEAYCVyTT1uUykaWitGAQIB1oy22WoKOhKQMCCMKa0dLypYN9dTs7HcMvg5YCAHQKAzLmwpwpYGbORBHH2LAfMY4G4JdmOaJkvBQnsMQ+DHAl5MTSeqjaMASaarvZ00SB8UATCyp1OVzMWgfBDiwLhY7J2+Nn5LScyVCkUfkoI3nLqWivAcB7j52HYSISMEJz9WIwEyyE/AAtEBJLbRLoNiBxigIcVgDO08AwFwnkpwfx4Sx1aSFrmLwAvRDz+BBtaFB6Gg9txA9sEg6d9NLNO+/5HvFz0sXXardmy567d4CFW4F5V1BuXiUgVNBa5jpdEBdz2vTRy2/cyxMtduyFpTjtMotobD1D75Yvs3LjopYDwh9v/5CNWrtsOSjGc/8bFqP/mHtRx7zyVodP7tisgZMeffB8SO6xfLYeIlllvTSkM2jH34UraQeB5VkvexoeWWsttR7bEaPu9Cz95IEZbAVw8wm461+7uuXrp4Q0L6LxxS/NKQQ+t2HpYKEKQPMhXkpkNqoYwXTEA+kphQitc/vYAAAAASUVORK5CYII=',
    },
    icivics: {
        url: 'https://www.icivics.org/',
        title: 'Home | iCivics',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAV1BMVEVHcEz/ZAD/ZwD/WwD/WwD/YAD/ZAD/WwD/WwD/WwD/WwD/WwD/WwD/WwD/ZgD/WwD/WwD/WwD/aAD/gAD/kQD/kAD/kQD/kQD/kQD/ZQD/kQD/jQD/bwAvM226AAAAHHRSTlMACCEwRhgPhrjT4e6tdjyd+/9a///yfrli/53evbsBzAAAAOVJREFUeAGtkgUSwlAMRL+71u3+18QSHDrWheqbbpQcIcq4EIJL+o2U0MY672yI6ZPx7EoFFavVG0sWCeDAXpmr7zLy6Wnrp7JCpjK6OZMNhvYNQgGmPidKVMq+XhXAmGpgmKPMpV4LAsgM5HDPkMX4bAWkU+KzVZ91FMjgQwDbrv8FwfYCh5+2zFxhNz4SGqbEFCVYSqlzd/kUS1m6fjU5ymcT2gtdbk1Y+q7bsAnYvvlCu3VcxvVybbF9mBJSUAuNfyt1A9zOMLLPYc/bts1vw95fExC9LZi7zoP/Xs0kEpfkAJ0B2VoUsYiyizsAAAAASUVORK5CYII=',
    },
    clever: {
        url: 'https://clever.com/in/login',
        title: 'Clever | Portal',
        icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi3ptQJ9ibYtsUiQ1yNX5abVZvtmG9fwqjNpUqzO6N8qbrYgM:https://resources.finalsite.net/images/f_auto,q_auto/v1689877141/mooreschoolscom/emadd6nvplrnh1vsswjf/Clever-Logo.jpg&s',
    },
    khanacademy: {
        url: 'https://www.khanacademy.org/',
        title: 'Khan Academy',
        icon: 'https://www.khanacademy.org/favicon.ico',
    },
    googledocs: {
        url: 'https://docs.google.com/document/',
        title: 'Google Docs',
        icon: 'https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_document_x16.png',
    },
    outlook: {
        url: 'https://outlook.live.com/mail/',
        title: 'Outlook Mail',
        icon: 'https://outlook.live.com/favicon.ico',
    },
    calculator: {
        url: 'https://www.calculator.net/',
        title: 'Calculator',
        icon: 'https://www.calculator.net/favicon.ico',
    },
    google: {
        url: 'https://www.google.com/',
        title: 'Google',
        icon: 'https://google.com/favicon.ico',
    },
    googleclassroomsearch: {
        url: 'https://www.google.com/search?q=Google+Classroom',
        title: 'Google Classroom - Google Search',
        icon: 'https://google.com/favicon.ico',
    },
    activatelearning: {
        url: 'https://activatelearning.com/',
        title: 'Activate Learning Digital Platform - Home',
        icon: 'https://activatelearning.com/wp-content/uploads/2023/05/favicon.png',
    },
    gallopade: {
        url: 'https://gallopade.com/',
        title: 'Gallopade: Educational Products, Social Studies Curriculum, Reading, Common Core',
        icon: 'https://gallopade.com/favicon.ico',
    },
    ilclassroom: {
        url: 'https://ilclassroom.com//',
        title: 'Classes | IL Classroom',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAV1BMVEVHcEwAAHwAAH0AAHwAAHwAAHwAAHwAAH0AAHwAAHwAAHwAAHwAAHoaGoMoKIYAAHZGR5fv8vv///+oqs6Mjr78///3+f5ucKzU1uk4OI/j5vPCxN+fosqdJ3hnAAAADHRSTlMAN4bC6//oX+wj1USkbhSpAAABF0lEQVR4AYTSBwKEIAwEQCxrjQY5g/X/7zwi1+vaHQsEzC1JmuVAkaWJeU1Z4JaqfKK6wVOa+m4t3tI+22etASIg7u+JX25AXR+A++5RG7USZAd3Yh7FT4x7tM0VeHYiSzeIW0F3LELfAd6c810/iBxIIdAkJgWo39aJr8i0LB0rpyZDUGamC/I0e1m3PmhmimAYT5Yj8uiciLiNgdwA4N25FRGtiouIA2cRbw+kXWGcV0uK+RPq6QomqBUm+4ikmJn0/bPzvh6fTbUIdEcsXlsUG5QYU2iFxB/lm+mhK9VT4f0wMdhug1tPHaG8DRlDh4wBULjS8jWfBzu2tf47TVR/2M+pqSmr85CSACxRo2QHNmA0IWcHAAp4HJXYNfpWAAAAAElFTkSuQmCC',
    },
    zearn: {
        url: 'https://www.zearn.org/student-home',
        title: 'Student Home - Zearn',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAYFBMVEVHcExFvdM6utGKxq8/u9I8utFIvtM8utFFvNM+u9JJvdNAu9Jnxdg/u9E9utFIvtQ/u9E8utFxydolutn1z0D+0Cr1z0H1zj/1z0L1z0H1z0H1zj/1z0H31GD1z0H10EovluFDAAAAIHRSTlMA2P8Vrf8v9EuXcci5auP/XGR9wLmh4v9CW5Vod9EfI0NLlVAAAACgSURBVHgBddDFAcRADATBRTMzO/8ojyTzXH9rUeKUVFKLPxllrXUEzrXfPIy+/RVglaQ+1lD91GCNSENxLk5cm34jvKhnP6lvlvMf7zyVHJhh5HzXdS+Yi2eFIjPAPLYQmGMpCUyDx+yVVIisqilkTUt1wCq2HtjANgKb2CZgXcvNc1VV9TAMJ2wfNbvp9tmyK8B1x/5hlThaur4fT/Ek3sqLEwwJ2FthAAAAAElFTkSuQmCC',
    },
    pearassessment: {
        url: 'https://app.edulastic.com/home/assignments/',
        title: 'Pear Assessment',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAY1BMVEVHcEwrOkIsO0I0QkMoN0InNkIiMUEnNUImNUEqOEIwPkI0QkMzQEMxP0IyQEMxP0PI21fL3lfQ5FjO4Vi4ylR2hUphcEVNXEKer1CnuVFqekbU6FmAlTmvwVNbaUdATkQAF0B9mIX1AAAAEHRSTlMApyf621LnZv7HHJjFfLc+PB2r8AAAALxJREFUKJHFkEkWgzAMQwljAg+I7cxhuv8pC3RHwrbV9luS7aL4q/qpHothyqGRVWGxVTXk4GCXZTHiJVVYY6v5rXPumDhb37zGe1PnWbdFgLh1WdiuICWsbY41FuUptE0GcgUXBMVTxjTJW6RZarxtBOdIYm0MXdtoFYDMs7W7UkEFFYj085obKocgHSaw3FGCPFbUIe7ls7R2JMHzYyOXfrDnHgEQo+d9emjJjVPKGZ6EfpcSbSvyf/+dPiDkDIV9PRLKAAAAAElFTkSuQmCC',
    },
    googleslides: {
        url: 'https://docs.google.com/presentation/',
        title: 'Google Slides',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAaVBMVEX0tAD///8AAAD75ajzqwDzrQD52Iv//fb4twDxsgD7uQDprAAiGQDzsABkSgD/vQAZEgCugQCVbgDdowAqIAAmHADKlQD3y1vAjgC7iQCccwAUDwBOOgCNaAAzJQDhpwBrTwBdRAANCgDVPr2xAAACrUlEQVR4nO3c23KbMBCAYVVtEiEIBws72KD48P4PWXBKnMRJp06HYdn5vzvf7T9ac7jB2I/a53zVhMQsTRK2u7xur3rM+59ZF/eF927ucb/FOV+E2NV/KVznVeLnnvP/OJ9sD/VXhccqXXjfmUur/PRZYRmDhr6BD7G8LsyadJn/vs+4tMk+FmYbPX0Dv8neF2oL7I9xTDRKAy+J58Ky0XKNecs15Vh4iunc00wijWNhHvTt6MCF40thXWnc0YGv1ufCg84dHaT5UFhvde7owFdZX9gt70Xp3yVdXxi1/gsHPlrTKr2Q/rFvTV3MPcSkimeTa17Sfk1zs1O9pMavjOJ7xcA1Jsw9w8SC0Xw3HGjvAwAAAAAAAAAAAAAAy/D4a1kebw58+rksT7cm3t3/WJb7u5sLH+ae+SYPFFIoHoUUykchhfJRSKF8FFIoH4UUykchhfJRSKF8FFIoH4UUykchhfJRSKF8FFIoH4UUykchhfJRSKF8FFIoH4UUykchhfJRSKF8FFIoH4UUykchhfJRSKF8FFIoH4UUykchhfJRSKF8FFIoH4UUykchhfJRSKF83ymce+Yb3Vyo/zvC+r8FDQAAAAAAAAAAAAAAMIFk7gEmlpgw9wgTC6Zxc88wKbc1Kz/3EJNyO5PrLvS5eS7mHmJSRW3a/dxDTMmF1tioeU19tMZ2mu+ISdcXZpXeQ3Tbui+0eTr3IJNJD3YoXKs9RF/V50J7DDqfa1zI7UuhjTr3NI2nsbBU+XDqm9KOhTbb6Et0m8xeChUmjoFjYZ+o64L6GvhaaLMm1XOMLm3GwEuhLWPQcow+xNJeF9pTXqUaGn1aHS9VbwutrQ/bxC97V51PqnxtvyrsG7sYCu+WWem8L/axy94nfSjstXW+24blvVIloVnlz+1Vz29MQXJQo6ciNgAAAABJRU5ErkJggg==',
    }
};

function setPreset(object) {
    preferences.cloakUrl = object.url;
    preferences.maskTitle = object.title;
    preferences.maskIconUrl = object.icon;
    localStorage.setItem('preferences', JSON.stringify(preferences));
    
    alert('Preset will take place upon next opening! Please close this window and reopen!');

}

function updatePreset() {
    setPreset(presets[document.getElementById('presets').value]);
}

if (preferences.cloak && window.location.href == window.top.location.href) {
    if (popupsAllowed()) {
        makecloak();
    } else {
        currentMenu.fadeOut(300, () => {
            $('.cloaklaunch').fadeIn(200);
        });
        currentMenu = $('.cloaklaunch');
        document.addEventListener('click', (event) => {
            if (event.target.id == 'disableCloak') {
                $('.cloaklaunch').fadeOut(200);
                setTimeout(returnHome, 200);
                return;
            }
            if (event.target.className != 'cloaklaunch' && event.target.className != 'cloaker') return;
            event.preventDefault();
            makecloak();
        });
    }
}

maskCheckbox.addEventListener('change', function () {
    preferences.mask = maskCheckbox.checked;
    localStorage.setItem('preferences', JSON.stringify(preferences));
});

cloakCheckbox.addEventListener('change', function () {
    preferences.cloak = cloakCheckbox.checked;
    localStorage.setItem('preferences', JSON.stringify(preferences));
});

backgroundCheckbox.addEventListener('change', function () {
    preferences.background = backgroundCheckbox.checked;
    localStorage.setItem('preferences', JSON.stringify(preferences));
    inGame = !preferences.background;
});

/* if it is wanted to save on input change wather than submission
document.querySelector('.text-field').addEventListener('change', function () {
    preferences.maskTitle = maskTitle.value;
    localStorage.setItem('preferences', JSON.stringify(preferences));
});
*/

document.getElementById('cloakUrlSubmit').addEventListener('click', function () {
    preferences.cloakUrl = cloakUrl.value;
    localStorage.setItem('preferences', JSON.stringify(preferences));
    alert('Submitted! Change will take place upon refresh');
});

document.getElementById('maskTitleSubmit').addEventListener('click', function () {
    preferences.maskTitle = maskTitle.value;
    localStorage.setItem('preferences', JSON.stringify(preferences));
    alert('Submitted! Change will take place upon refresh');
});

document.getElementById('maskIconSubmit').addEventListener('click', function () {
    preferences.maskIconUrl = maskIcon.value;
    localStorage.setItem('preferences', JSON.stringify(preferences));
    alert('Submitted! Change will take place upon refresh');
});

document.getElementById('download').addEventListener('click', function () {
    downloadMainSave();
});

document.getElementById('upload').addEventListener('click', function () {
    uploadMainSave();
});

/* if (preferences.cloak && !localStorage.getItem("cloakTabOpened")){
    if (window.top.location.href !== "about:blank"){
        localStorage.setItem("cloakTabOpened", "true");
        document.addEventListener("click", (event) => {event.preventDefault(); makecloak()});
    }
    makecloak();

    window.addEventListener("beforeunload", () => {
        localStorage.removeItem("cloakTabOpened");
    });
} */
if (preferences.mask) {
    mask();
}
