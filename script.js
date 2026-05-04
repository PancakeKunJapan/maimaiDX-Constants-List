let currentDiff = 'mas'; 
let currentViewMode = 'grid';
let allSongs = [];

const VERSION_ORDER = [
    "maimai", "maimai PLUS", "GreeN", "GreeN PLUS", "ORANGE", "ORANGE PLUS",
    "PiNK", "PiNK PLUS", "MURASAKi", "MURASAKi PLUS", "MiLK", "MiLK PLUS",
    "FiNALE", "でらっくす", "でらっくす PLUS", "Splash", "Splash PLUS",
    "UNiVERSE", "UNiVERSE PLUS", "FESTiVAL", "FESTiVAL PLUS", "BUDDiES", "BUDDiES PLUS",
    "PRiSM", "PRiSM PLUS", "CiRCLE", "CiRCLE PLUS"
];

async function init() {
    try {
        const response = await fetch('songs.json');
        if (!response.ok) throw new Error("JSON load failed");
        allSongs = await response.json();
        loadSongs();
    } catch (e) {
        console.error(e);
        document.getElementById('songList').innerHTML = "データの読み込みに失敗しました。";
    }
}

function checkAll(groupId, state) {
    document.querySelectorAll(`#${groupId} input`).forEach(cb => cb.checked = state);
    loadSongs();
}

function setViewMode(mode) {
    currentViewMode = mode;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');
    document.getElementById('songList').className = `grid ${mode}-mode`;
    loadSongs();
}

function changeDiff(diff) {
    currentDiff = diff;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diff === diff);
    });
    loadSongs();
}

function loadSongs() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const sortOrder = document.getElementById('sortOrder').value;
    const selectedVersions = Array.from(document.querySelectorAll('#versionFilters input:checked')).map(el => el.value);
    const keyMap = { bas: 'basic', adv: 'advanced', exp: 'expert', mas: 'master', rem: 'remaster' };

    let filtered = allSongs.filter(s => {
        let ver = s.version;
        if (ver === "DX") ver = "でらっくす";
        if (ver === "DX PLUS") ver = "でらっくす PLUS";

        const matchSearch = s.title.toLowerCase().includes(query) || 
                            (s.artist && s.artist.toLowerCase().includes(query)) ||
                            (s.reading && s.reading.toLowerCase().includes(query));
        const matchVer = selectedVersions.includes(ver);
        return matchSearch && matchVer;
    });

    filtered.sort((a, b) => {
        if (sortOrder === "title_asc") return a.title.localeCompare(b.title, 'ja');
        if (sortOrder.startsWith("version")) {
            const idxA = VERSION_ORDER.indexOf(a.version);
            const idxB = VERSION_ORDER.indexOf(b.version);
            return sortOrder === "version_desc" ? idxB - idxA : idxA - idxB;
        }
        const valA = a.constants[keyMap[currentDiff]] ?? 0;
        const valB = b.constants[keyMap[currentDiff]] ?? 0;
        if (sortOrder === "desc") return valB - valA || a.title.localeCompare(b.title, 'ja');
        if (sortOrder === "asc") return valA - valB || a.title.localeCompare(b.title, 'ja');
    });

    render(filtered);
}

function render(songs) {
    const container = document.getElementById('songList');
    const keyMap = { bas: 'basic', adv: 'advanced', exp: 'expert', mas: 'master', rem: 'remaster' };
    const fullNameMap = { bas: 'BAS', adv: 'ADV', exp: 'EXP', mas: 'MAS', rem: 'Re:M' };

    container.innerHTML = songs.map(song => {
        const val = song.constants[keyMap[currentDiff]];
        const isNull = val === null || val === undefined;
        const displayVal = isNull ? '-' : Number(val).toFixed(1);

        // 背景画像用の変数をstyle属性で渡す修正を追加
        return `
            <div class="song-card cat-${song.category}" style="--bg-img: url('${song.jacket}')">
                <div class="song-jacket">
                    <img src="${song.jacket}" loading="lazy" onerror="this.src='https://placehold.jp/150x150?text=No+Image'">
                </div>
                <div class="song-info">
                    <div class="title-row">
                        <span class="song-type type-${song.type}">${song.type === 'dx' ? 'DX' : 'STD'}</span>
                        <div class="song-title">${song.title}</div>
                    </div>
                    <div class="song-artist">${song.artist || ''}</div>
                    <div class="difficulty-grid">
                        <div class="diff-box ${currentDiff}">
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

window.onscroll = () => {
    document.getElementById('backToTop').style.display = window.scrollY > 500 ? 'flex' : 'none';
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', init);