let currentDiff = 'mas'; 
let currentViewMode = 'grid';
let allSongs = [];
let jacketSize = 110; 

// 並び替え用のバージョン順定義
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

// ★全選択・全解除ボタン用の関数
function checkAll(groupId, state) {
    const checkboxes = document.querySelectorAll(`#${groupId} input[type="checkbox"]`);
    checkboxes.forEach(cb => {
        cb.checked = state;
    });
    loadSongs(); // 状態を変えた後に再描画
}

function setViewMode(mode) {
    currentViewMode = mode;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');
    document.getElementById('songList').className = `grid ${mode}-mode`;
    
    const sizeControl = document.getElementById('size-control');
    if (sizeControl) sizeControl.style.display = (mode === 'list') ? 'none' : 'flex';
    
    loadSongs();
}

function changeSize(amount) {
    jacketSize = Math.max(60, Math.min(220, jacketSize + amount));
    document.documentElement.style.setProperty('--jacket-size', `${jacketSize}px`);
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
        // バージョン名の正規化（ songs.json の形式に合わせる）
        let ver = s.version;
        if (ver === "DX") ver = "でらっくす";
        if (ver === "DX PLUS") ver = "でらっくす PLUS";
        
        const matchSearch = s.title.toLowerCase().includes(query) || (s.artist && s.artist.toLowerCase().includes(query));
        const matchVer = selectedVersions.includes(ver);
        return matchSearch && matchVer;
    });

    // ソート処理
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

    container.innerHTML = songs.map(song => {
        const val = song.constants[keyMap[currentDiff]];
        const displayVal = (val === null || val === undefined) ? '-' : Number(val).toFixed(1);

        return `
            <div class="song-card cat-${song.category}" style="--bg-img: url('${song.jacket}')">
                <!-- カード・ジャケットモード用の要素 -->
                <div class="song-jacket">
                    <div class="title-row">
                        <span class="song-type type-${song.type}">${song.type === 'dx' ? 'DX' : 'STD'}</span>
                    </div>
                    <img src="${song.jacket}" loading="lazy">
                </div>

                <div class="song-info">
                    <!-- リストモード用レイアウト: タイプ 曲名 アーティスト バージョン -->
                    <div class="list-layout-wrap">
                        <span class="song-type type-${song.type}">${song.type === 'dx' ? 'DX' : 'STD'}</span>
                        <div class="song-title-group">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist || ''}</div>
                        </div>
                        <div class="song-version">${song.version}</div>
                    </div>

                    <!-- 定数表示ボックス -->
                    <div class="diff-box ${currentDiff}">
                        <strong>${displayVal}</strong>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('count').textContent = `${songs.length} 件`;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onscroll = () => {
    const btn = document.getElementById('backToTop');
    if (btn) btn.style.display = window.scrollY > 500 ? 'flex' : 'none';
};

document.addEventListener('DOMContentLoaded', init);