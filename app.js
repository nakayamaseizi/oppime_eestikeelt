function loadExcelFile(event) {
    const file = event.target.files[0];
    if (!file) return; // ファイルがない場合は何もしない

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const dictionary = XLSX.utils.sheet_to_json(worksheet, {header:1});
            const formattedDictionary = dictionary.map(row => ({ estonian: row[0], english: row[1] }));
            localStorage.setItem('dictionary', JSON.stringify(formattedDictionary));
            alert('ファイルが正常に読み込まれました。');
            // ファイルが読み込まれた後、単語テストまたは単語一覧表示のどちらかを選択できるようにする
            document.getElementById('startButtons').style.display = 'block';
        } catch (error) {
            console.error('Error reading file:', error);
            alert('ファイルの読み込みに失敗しました。');
        }
    };
    reader.readAsArrayBuffer(file);
}

function getDictionary() {
    const storedDictionary = localStorage.getItem('dictionary');
    return storedDictionary ? JSON.parse(storedDictionary) : [];
}

// 配列をランダムにシャッフルする関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.startTest = function() {
    const dictionary = getDictionary(); // ローカルストレージからデータを取得

    const estonianWordDiv = document.getElementById('estonianWord');
    const englishWordDiv = document.getElementById('englishWord');
    const wordListTable = document.getElementById('wordList');
    const resetButton = document.getElementById('resetButton');

    // Clear the word list and reset button visibility
    wordListTable.style.display = 'none';
    resetButton.style.display = 'none';
    estonianWordDiv.style.display = 'block';
    englishWordDiv.style.display = 'block';

    let wordsUsed = [];
    let currentWordIndex = -1;

    // ランダムな順番で単語を表示する関数
    function displayNewWord() {
        if (wordsUsed.length === dictionary.length) {
            // すべての単語を表示した後に「TUBLI !」を表示
            estonianWordDiv.textContent = "TUBLI !";
            englishWordDiv.textContent = "";
            estonianWordDiv.style.cursor = "default";
            estonianWordDiv.onclick = null;
            resetButton.style.display = 'block';
            return;
        }

        if (wordsUsed.length === 0) {
            // 最初の表示の場合、単語リストをシャッフル
            shuffleArray(dictionary);
        }

        do {
            currentWordIndex = (currentWordIndex + 1) % dictionary.length;
        } while (wordsUsed.includes(currentWordIndex));

        estonianWordDiv.textContent = dictionary[currentWordIndex].estonian;
        englishWordDiv.textContent = "";  // Clear previous translation
        estonianWordDiv.style.cursor = "pointer";
        estonianWordDiv.onclick = function() {
            if (englishWordDiv.textContent === "") {
                englishWordDiv.textContent = dictionary[currentWordIndex].english;
            } else {
                wordsUsed.push(currentWordIndex);
                displayNewWord();
            }
        };
    }

    displayNewWord();
};

window.showWordList = function() {
    const dictionary = getDictionary(); // ローカルストレージからデータを取得

    const estonianWordDiv = document.getElementById('estonianWord');
    const englishWordDiv = document.getElementById('englishWord');
    const wordListTable = document.getElementById('wordList');
    const resetButton = document.getElementById('resetButton');

    estonianWordDiv.style.display = 'none';
    englishWordDiv.style.display = 'none';
    resetButton.style.display = 'none';

    // Display the word list table
    wordListTable.style.display = 'table';

    // Clear existing rows except for the header
    while (wordListTable.rows.length > 1) {
        wordListTable.deleteRow(1);
    }

    // Populate the table with word pairs
    dictionary.forEach(function(wordPair) {
        const row = wordListTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.textContent = wordPair.estonian;
        cell2.textContent = wordPair.english;
    });

};

window.resetToStartScreen = function() {
    const estonianWordDiv = document.getElementById('estonianWord');
    const englishWordDiv = document.getElementById('englishWord');
    const wordListTable = document.getElementById('wordList');
    const resetButton = document.getElementById('resetButton');

    estonianWordDiv.textContent = "";
    englishWordDiv.textContent = "";
    wordListTable.style.display = 'none';
    resetButton.style.display = 'none';

    document.getElementById('startButtons').style.display = 'block';  // Show start buttons again
};

// ファイル選択時にExcelファイルを読み込む
document.getElementById('fileInput').addEventListener('change', loadExcelFile);
