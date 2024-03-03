// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc, setDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCYR_1OPyHeYox5x0RWH-_tw3a7a9GOwPY",
    authDomain: "millionaire-5b78e.firebaseapp.com",
    projectId: "millionaire-5b78e",
    storageBucket: "millionaire-5b78e.appspot.com",
    messagingSenderId: "908681721994",
    appId: "1:908681721994:web:43d32e3cc240b81eb2d573"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getScores() {
    // To get the current high scores
    const values = [];

    let docRef = collection(db, "HighScores");
    const snapshot = await getDocs(query(docRef, orderBy("Score", "desc"))); // Orders by highscore
    snapshot.forEach((doc) => {
        values.push(doc.data());
        console.log(doc.data());
    })

    return values;
}

export async function updateScores(Name, Score) {
    // To update the current scores
    let nameFound = false;
    let docRef = collection(db, "HighScores");
    const snapshot = await getDocs(docRef);
    snapshot.forEach((doc) => {
        if (doc.data().Name === Name) {
            if (doc.data().Score < Score) {
                updateNewHighScore(Name, Score, doc.id)
            }
            nameFound = true;
        }
    })

    if (!nameFound) {
        await addScores(Name, Score);
    }
}

export async function addScores(Name, Score) {
    // Add new scores to the database
    await addDoc(collection(db, "HighScores"), {
        Name: Name,
        Score: Score
    });
}
export async function updateNewHighScore(Name, Score, id) {

    // Update the score
    const docRefToAdd = doc(db, "HighScores", id);
    await updateDoc(docRefToAdd, {
        Score: Score
    });
}

const {createApp} = Vue

let i = 0;
let time;
let timeleft = 0;
let timer;
let response;

createApp({
    // Adds event listeners to listen for keyboard presses for player choices to call keyboardPress function
    created() {
        window.addEventListener('keyup', this.keyboardPress);
    },

    beforeUnmount() {
        window.removeEventListener('keyup', this.keyboardPress);
    },

    data() { // Initialize variables for program
        return{
            showApp: true,
            isGameStarted: false,
            prize: "$0",
            winState: "GAMEOVER!",
            Name: "",
            correct: 0,
            values: []
        }
    },
    methods: {
        logName() {
            this.Name = document.getElementById("usrInput").value;
            if (this.Name === "") {}
            else {
                console.log("NAME IS LOGGED")
                this.showApp = false // To make Title screen disappear
                this.isGameStarted = true

                // Gets questions from json file
                let getQuestions = async () => {
                    const q = "./data/questions.json"

                    let response = await fetch(q);
                    return await response.json();
                }

                getQuestions().then(r => {
                    console.log(r);
                    response = r;
                    this.getNextQuestion(); // Goes into first question
                });
            }
        },

        getNextQuestion() {
            let board = document.getElementById("board");

            // Define questions2 function using arrow function
            console.log("timeleft:" + timeleft)
            if (i === 14) { // Final question
                time = (response[i].time / 1000) + timeleft;
            }
            else {
                time = response[i].time / 1000;
            }
            console.log(time);
            let question = response[i].question;
            let a = response[i].a;
            let b = response[i].b;
            let c = response[i].c;
            let d = response[i].d;
            this.prize = response[i].amt;

            // Questions with choices and timer
            board.innerHTML = `
    <div class="container text-center">
        <div class="row" id="game">
            <div class="title col-6 col-sm-4 bg-primary border border-danger" id = "amt">${this.prize} QUESTION</div>
            <div class="title col-6 col-sm-4 bg-primary border border-danger" id = "countdown">${time}s left</div>

            <div class="w-100 d-none d-md-block"></div>

            <div class="title col-8 bg-primary border border-danger" id = "q">${question}</div>

            <div class="w-100 d-none d-md-block"></div>

            <div class="buttons col-6 col-sm-4 bg-primary border border-danger" id = "a"">A: ${a}</div>
            <div class="buttons col-6 col-sm-4 bg-primary border border-danger" id = "b">B: ${b}</div>

            <!-- Force next columns to break to new line at md breakpoint and up -->
            <div class="w-100 d-none d-md-block"></div>

            <div class="buttons col-6 col-sm-4 bg-primary border border-danger" id = "c">C: ${c}</div>
            <div class="buttons col-6 col-sm-4 bg-primary border border-danger" id = "d">D: ${d}</div>
        </div>
    </div>
    `
            // Timer countdown
            const countdown = document.getElementById("countdown");

            timer = setInterval(() => {
                time--;
                countdown.innerHTML = `${time}s left`;
                if (time === 0) {
                    clearInterval(timer);
                    // Game over function
                    window.setTimeout(this.gameover(), 1000);
                }
            }, 1000);

        },

        // Gameover function that hides the board, determines how much the player has won, and displays the winnings
        // with the highscores of other players.
        gameover() {
            //window.setTimeout(function(){alert("GAMEOVER!")}, 2000);
            this.isGameStarted = false;
            window.setTimeout(function(){document.getElementById("board").style.visibility = "hidden"}, 1000);
            if (this.correct < 5) this.prize = "$0";
            else if (this.correct >= 5 && this.correct < 10) this.prize = "$1000";
            else if (this.correct >= 10 && this.correct < 15) this.prize = "$32000";
            updateScores(this.Name, this.correct).then(r => {
                getScores().then(r => {
                    console.log(r);
                    document.getElementById("theBody").innerHTML = `
                    ${r.map((object) => {
                        return(`
                        <tr>
                            <td style="color:white">${object.Name}</td>
                            <td style="color:white">${object.Score}</td>
                        </tr>
                        `)
                    })}
                `
                });
            });
            // appends modal
            $('#gameoverModal').modal('show');

            const refresh = document.getElementById("closeBtn");

            // Reloads page if player clicks closeBtn or clicks out of modal
            $('#gameoverModal').on('hidden.bs.modal', () => {
               location.reload();
            });

            refresh.addEventListener('click', () => {
                location.reload();
            });
            //document.getElementById("body").appendChild(HS);
            //document.getElementById("body").appendChild(RESTART);
        },

        keyboardPress(event) {
            const validKeys = ['a', 'b', 'c', 'd'];
            // Once the game has started and a valid letter has been pressed, an answer can be chosen
            if (validKeys.includes(event.key.toLowerCase()) && this.isGameStarted === true) {
                console.log(`Key '${event.key}' was pressed`);
                timeleft += time;
                clearInterval(timer);
                if (event.key.toLowerCase() === response[i].correct) {
                    console.log("Correct!");
                    this.correct++;
                    if (i === 14) { // Player wins whole game
                        console.log("Millionaire!");
                        this.winState = "Millionaire!"
                        window.setTimeout(this.gameover(), 1000);
                    } else { // Player is correct, iterate i to get next question and call getNextQuestion
                        i++;
                        this.getNextQuestion();
                    }
                }
                else { // Player is incorrect, gameover
                    console.log("Incorrect!");
                    window.setTimeout(this.gameover(), 1000);
                }
            }
        }
    }
}).mount("#app")