console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currentFolder = "songs";

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    mins = mins < 10 ? "0" + mins : mins;
    secs = secs < 10 ? "0" + secs : secs;
    return `${mins}:${secs}`;
}

async function getSongs(folder) {
    // let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let res = await fetch(`songs/${folder}/info.json`);
    let data = await res.json();
    return data.songs;
}

const playMusic = (track, pause = false) => {

   currentSong.src = `${currentFolder}/` + track
    if (!pause) {
        currentSong.play();
        document.querySelector("#play img").src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = formatSongName(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

// Display all the album on the page
async function displaySongs(folder) {
    currentFolder = `songs/${folder}`;
    songs = await getSongs(folder);         // fetch songs for this folder
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";                  // clear old songs first
    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${formatSongName(song)}</div>
                <div>Somraj</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="img/play.svg" alt="">
            </div>
        </li>`;
    }
    attachSongListeners();            // reattach click listeners
}

function attachSongListeners() {
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index])
        })

        // play button inside each li
        e.querySelector(".playnow").addEventListener("click", (event) => {
            event.stopPropagation();  // prevent li click from firing
            playMusic(songs[index])
        })
    })
}


async function getPlaylistInfo(folder) {
    try {
        let response = await fetch(`songs/${folder}/info.json`);
        let data = await response.json();
        return data;
    } catch (e) {
        console.log("info.json missing for folder:", folder);
        return { title: folder, description: "Unknown", cover: "cover.jpg" };
    }

}

async function main() {
    await displaySongs("Aashiqui 2");
    let folders = ["Aashiqui 2","Bhakti","Cult hits","Dance hits","Dhurandhar","In Dino"];
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";  // clear hardcoded cards

    for (const folder of folders) {
        let info = await getPlaylistInfo(folder);
        cardContainer.innerHTML += `
        <div class="card" data-folder="${folder}">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#1DB954" />
                    <path d="M9 7L17 12L9 17Z" fill="black" />
                </svg>
            </div>
           <img src="songs/${folder}/${info.cover}" alt="">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
        </div>`;
    }

    playMusic(songs[0], true)

    // card click listeners
    Array.from(document.querySelectorAll(".card")).forEach(card => {
        // card click — just loads songs into library
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            await displaySongs(folder);
        })

        // play button click — loads and plays
        card.querySelector(".play").addEventListener("click", async (e) => {
            e.stopPropagation();  // prevents card click from also firing
            let folder = card.dataset.folder;
            await displaySongs(folder);
            playMusic(songs[0]);
        })
    })

    // Attach an event listener to play next and previous
    let play = document.querySelector("#play img")  // img inside the play button div
    document.querySelector("#play").addEventListener("click", async () => {

        if (currentSong.paused) {
            await currentSong.play()
            play.src = "img/pause.svg";

        }
        else {
            currentSong.pause()
            play.src = "img/play.svg";

        }
    })

    // Listen for time update event

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous 
    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));

        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[songs.length - 1]); // loop to last
        }
    });

    // Add an event listener to next
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));

        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]); // loop to first
        }
    });

    // Add an event listener to volume bar
    document.querySelector(".volumebar").addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
    })

    // Add an event listener to mute the track
    document.querySelector(".volume").addEventListener("click", ()=>{
        if(currentSong.volume > 0){
            currentSong.volume = 0;
            document.querySelector(".volume").src = "img/mute.svg";
            document.querySelector(".volumebar").value = 0;
        }
        else{
            currentSong.volume = 1;
            document.querySelector(".volume").src = "img/volume.svg";
            document.querySelector(".volumebar").value = 100;

        }
    })

}

main()

const songNameMap = {
    "KHAIRIYAT BONUS TRACK CHHICHHORE Sushant Shraddha Pritam Amitabh B Arijit Singh": "Khairiyat"
}

function formatSongName(song) {
    let name = song
        .replaceAll("_", " ")
        .replace("(PagaiWorld.com)", "")
        .replace("320", "")
        .replace(".mp3", "")
        .trim();

    return songNameMap[name] || name;  // use custom name if exists, else use formatted name
}