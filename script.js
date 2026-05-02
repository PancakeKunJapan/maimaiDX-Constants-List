let currentDiff = 'mas'; 

const VERSION_ORDER = [
    "maimai", "maimai PLUS", "GreeN", "GreeN PLUS", "ORANGE", "ORANGE PLUS",
    "PiNK", "PiNK PLUS", "MURASAKi", "MURASAKi PLUS", "MiLK", "MiLK PLUS",
    "FiNALE", "でらっくす", "でらっくす PLUS", "Splash", "Splash PLUS",
    "UNiVERSE", "UNiVERSE PLUS", "FESTiVAL", "FESTiVAL PLUS", "BUDDiES", "BUDDiES PLUS",
    "PRiSM", "PRiSM PLUS", "CiRCLE", "CiRCLE PLUS"
];

function checkAll(groupId, state) {
    const checkboxes = document.querySelectorAll(`#${groupId} input`);
    checkboxes.forEach(cb => cb.checked = state);
    loadSongs();
}

function changeDiff(diff) {
    currentDiff = diff;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diff === diff);
    });
    loadSongs();
}

function compareTitles(a, b, isDesc = false) {
    const rubyA = a.ruby || a.title;
    const rubyB = b.ruby || b.title;
    const res = rubyA.localeCompare(rubyB, 'ja', { numeric: true, sensitivity: 'base' });
    return isDesc ? -res : res;
}

async function loadSongs() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const sortOrder = document.getElementById('sortOrder').value;
    const selectedVersions = Array.from(document.querySelectorAll('#versionFilters input:checked')).map(el => el.value);

    try {
        const response = await fetch('songs.json'); 
        let songs = await response.json();

        // 検索
        if (query) {
            songs = songs.filter(s => 
                s.title.toLowerCase().includes(query) || 
                (s.ruby && s.ruby.includes(query)) ||
                (s.artist && s.artist.toLowerCase().includes(query))
            );
        }
        // バージョンフィルタ
        songs = songs.filter(s => selectedVersions.includes(s.version));

        // ソート処理
        const keyMap = { bas: 'basic', adv: 'advanced', exp: 'expert', mas: 'master', rem: 'remaster' };
        
        songs.sort((a, b) => {
            if (sortOrder === "title_asc") return compareTitles(a, b, false);
            if (sortOrder === "title_desc") return compareTitles(a, b, true);
            
            if (sortOrder.startsWith("version")) {
                const idxA = VERSION_ORDER.indexOf(a.version);
                const idxB = VERSION_ORDER.indexOf(b.version);
                const res = (sortOrder === "version_desc") ? (idxB - idxA) : (idxA - idxB);
                return res === 0 ? compareTitles(a, b) : res;
            }

            const valA = a.constants[keyMap[currentDiff]] ?? 0;
            const valB = b.constants[keyMap[currentDiff]] ?? 0;
            let res = valA - valB;
            if (sortOrder === "desc") res *= -1;

            if (res === 0) {
                const vIdxA = VERSION_ORDER.indexOf(a.version);
                const vIdxB = VERSION_ORDER.indexOf(b.version);
                if (vIdxA !== vIdxB) return vIdxB - vIdxA;
                return compareTitles(a, b);
            }
            return res;
        });

        render(songs);
    } catch (e) {
        console.error("データの読み込みに失敗しました:", e);
    }
}

function render(songs) {
    const container = document.getElementById('songList');
    const keyMap = { bas: 'basic', adv: 'advanced', exp: 'expert', mas: 'master', rem: 'remaster' };
    const fullNameMap = { bas: 'BASIC', adv: 'ADVANCED', exp: 'EXPERT', mas: 'MASTER', rem: 'Re:MASTER' };

    container.innerHTML = songs.map(song => {
        const catClass = `cat-${song.category}`;
        let val = song.constants[keyMap[currentDiff]];
        const isNull = (val === null || val === undefined);

        let displayVal = isNull ? '-' : Number(val).toFixed(1);

        // タイプラベルのHTML生成
        let typeHtml = '';
        if (song.type === 'dx') {
            typeHtml = `<div class="song-type type-dx">でらっくす</div>`;
        } else if (song.type === 'std') {
            typeHtml = `<div class="song-type type-std">スタンダード</div>`;
        }

        // 長い曲名のフォントサイズ調整
        const titleLength = song.title.length;
        let fontSizeStyle = '';
        if (titleLength > 25) {
            fontSizeStyle = 'font-size: 0.75rem;';
        } else if (titleLength > 18) {
            fontSizeStyle = 'font-size: 0.85rem;';
        }

        return `
            <div class="song-card ${catClass}">
                ${typeHtml}
                <div class="song-jacket">
                    <img src="${song.jacket}" alt="${song.title}" loading="lazy" onerror="this.src='https://placehold.jp/150x150?text=No+Image'">
                </div>
                <div class="song-info">
                    <div>
                        <div class="song-title" style="${fontSizeStyle}">${song.title}</div>
                        <div class="song-artist">${song.artist || ''}</div>
                        <div class="song-version">${song.version}</div>
                    </div>
                    <div class="difficulty-grid">
                        <div class="diff-box ${currentDiff} ${isNull ? 'is-null' : ''}">
                            <span>${fullNameMap[currentDiff]}</span>
                            <strong>${displayVal}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('count').textContent = `${songs.length} 件`;
}

// 戻るボタンの表示・非表示制御
window.onscroll = function() {
    const btn = document.getElementById('backToTop');
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btn.classList.add('show');
    } else {
        btn.classList.remove('show');
    }
};

// スムーズスクロールでトップへ
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onload = loadSongs;