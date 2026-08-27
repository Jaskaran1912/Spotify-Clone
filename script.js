console.log("Lets write js");

let currentSong = new Audio();
let songs = [];
let currFolder;
let vol;

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML += `
        <li>
            <img class="Libmusic" src="svgs/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ").replaceAll("%2C", ",").replaceAll(".mp3", "").replaceAll("(DJJOhAL.Com)" , "")}</div>
                    <div>Aujla</div>
                </div>
                <img class="Libplay" src="svgs/play.svg" alt="">
        </li>`
    }

    //Attach an eventListener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML + ".mp3")
        })
    });
}

const playMusic = (track, paused = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!paused) {
        currentSong.play()
        document.getElementById("play").src = "svgs/pause.svg"
    }
    currentSong.play()
    document.querySelector(".songinfo").innerHTML = decodeURI(track).replaceAll("%2C", ",").replaceAll(".mp3", "").replaceAll("(DJJOhAL.Com)" , "")
    document.querySelector(".time").insertAdjacentHTML("afterbegin", "00:00 / 00:00")
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = Array.from(div.getElementsByTagName("a"))
    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("songs/")[1];
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            document.querySelector(".card-container").innerHTML += `<div data-folder="${response.data}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                                <!-- Green circular background -->
                                <circle cx="24" cy="24" r="24" fill="#1fdf64" />

                                <!-- Centered black play triangle -->
                                <path transform="translate(-1, 0)" fill="#000000"
                                    d="M19 15.5v17a1.5 1.5 0 0 0 2.29 1.28l13.5-8.5a1.5 1.5 0 0 0 0-2.56l-13.5-8.5A1.5 1.5 0 0 0 19 15.5z" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the playlist upon library click
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    });
}

let main = async () => {

    await getSongs("songs/")

    //disaply all the albums on the page
    displayAlbums()


    //Attach an eventListener to play, next and previous
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            document.getElementById("play").src = "svgs/pause.svg"
        }
        else {
            currentSong.pause()
            document.getElementById("play").src = "svgs/play.svg"
        }
    })


    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".time").innerHTML = formatTime(currentSong.currentTime) + "/" + formatTime(currentSong.duration)
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add an eventListener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.transform = "translateX(0)";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.transform = "translateX(-100%)";
    });

    //Add eventListener for next and previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.replaceAll(",", "%2C").split(currFolder + "/")[1])
        if (currentSong.currentTime > 3 || index == 0) {
            currentSong.currentTime = 0
        }
        else {
            playMusic(`${songs[index - 1]}`)
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(currFolder + "/")[1])
        if (index + 1 < songs.length) {
            playMusic(`${songs[index + 1]}`)
        }
        else {
            currentSong.currentTime = 0
            currentSong.pause()
        }
    })

    document.querySelector(".soundlevel").addEventListener("click", e => {
        e.stopPropagation()
        let percent = ((e.target.getBoundingClientRect().height - e.offsetY) / (e.target.getBoundingClientRect().height)) * 100
        console.log(percent);
        document.querySelector(".circlesound").style.bottom = (percent - 12) + "%"
        currentSong.volume = percent / 100
        if (percent < 10) {
            currentSong.volume = 0
            document.querySelector(".slash").style.display = "block"
        }
        else document.querySelector(".slash").style.display = "none"
    })

    document.querySelector(".volume").addEventListener("click", () => {
        if (currentSong.volume != 0) {
            vol = currentSong.volume
        }
        if (currentSong.volume != 0) {
            currentSong.volume = 0;
            document.querySelector(".slash").style.display = "block"
            document.querySelector(".circlesound").style.bottom = -12 + "%"
        }
        else {
            currentSong.volume = vol
            document.querySelector(".slash").style.display = "none"
            document.querySelector(".circlesound").style.bottom = (vol * 100 - 12) + "%"
        }
    })

}

main()
