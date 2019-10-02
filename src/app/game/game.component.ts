import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  pokedexUrl = `https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json`
  data: any = []
  currentPokemon: any
  wrongs: number = 0
  wrongLimit: number = 5
  chosenLetters: string[] = []
  level: number = 1

  constructor() { }

  ngOnInit() {

    // start game here
    this.start()
    console.log(this)
  }

  start = async () => {
    let pokedex = await fetch(this.pokedexUrl)
    this.data = await pokedex.json()

    this.prepareGame()
  }

  playAgain = () => {
    this.wrongs = 0
    this.level = 1
    this.currentPokemon = this.getRandomPokemon()
    this.chosenLetters = []
  }

  // this trims the pokemon up to gen 3 and converts names to all uppercase
  private prepareGame = () => {
    this.data = this.data.slice(0, 386).map(pokemon => {
      let lowerCasedName = pokemon.name.english.toUpperCase()
      pokemon.name.english = lowerCasedName
      return pokemon
    })

    // fix nidoran
    this.data = this.data.map(pokemon => {
      if (pokemon.name.english.includes("NIDORAN")) {
        pokemon.name.english = "NIDORAN"
      }
      return pokemon
    })

    // convert name to array of chars
    // for every character, a property of is hidden is initialized
    this.data = this.data.map(pokemon => {
      pokemon.nameArray = pokemon.name.english.split("")
      pokemon.nameArray = pokemon.nameArray.map(char => {
        let character = {
          char: char,
          is_hidden: true
        }
        return character
      })
      return pokemon
    })

    this.startGame()
  }

  getRandomPokemon = () => {
    let length = this.data.length
    let random = Math.floor(Math.random() * length)
    return this.data[random]
  }

  startGame = () => {
    this.currentPokemon = this.getRandomPokemon()
  }

  isGameOver = (): boolean => {
    return this.wrongs === this.wrongLimit
  }

  nextLevel = () => {
    if (this.isCompleted() && !this.isGameOver()) {
      this.wrongs = 0
      this.chosenLetters = []
      this.level += 1
      this.currentPokemon = this.getRandomPokemon()
    }
  }

  showAnswer = () => {
    this.currentPokemon.nameArray.map(char => {
      char.is_hidden = false
      return char
    })
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent = (event: KeyboardEvent) => {
    let key = event.key.toUpperCase()

    if (!this.isGameOver() && !this.chosenLetters.includes(key)) {
      if (this.checkLetterInPokemon(key)) {
        // show and set is hidden to false
        this.showAndSetToHidden(key)
      }
      else {
        if (!this.isGameOver()) {
          this.wrongs += 1
        }
        if (this.isGameOver()) {
          this.showAnswer()
        }
      }

    }
    else {
      if (this.isGameOver()) {
        this.playAgain()
      }
    }

    if (!this.chosenLetters.includes(key)) {
      this.chosenLetters.push(key)
    }

    this.nextLevel()
  }

  private isCompleted = (): boolean => {
    for (let char of this.currentPokemon.nameArray) {
      if (char.is_hidden) {
        return false
      }
    }
    return true
  }

  private checkLetterInPokemon = (letter: string): boolean => {
    let chars = this.currentPokemon.nameArray.map(c => c.char)
    return chars.includes(letter)
  }

  private showAndSetToHidden = (key: string) => {
    this.currentPokemon.nameArray.map(c => {
      if (key === c.char) {
        c.is_hidden = false
      }
      return c
    })
  }
}
