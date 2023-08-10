import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import { useNavigate } from 'react-router-dom';
import { GridEngine } from "grid-engine";
import Users from '../components/Users';
import { characters as charactersJson } from '../helpers/constants';

function GameComponent({ username, selectedChar, socket, role }) {
  const navigate = useNavigate();
  const [isStartedState, setIsStartedState] = useState(false);

  // config
  const configs = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
    backgroundColor: '#fff',
    physics: {
      default: 'arcade',
    },
    plugins: {
      scene: [
        {
          key: "gridEngine",
          plugin: GridEngine,
          mapping: "gridEngine",
        },
      ],
    },
    input: {
      mouse: {
        preventDefaultWheel: false
      },
      touch: {
        capture: false
      }
    }
  }

  useEffect(() => {
    if(username === ''){
      navigate('/', { replace: true });
    } else {
      const game = new Phaser.Game({
        ...configs,
        parent: 'game-content',
      });
    }
  }, []);


  // functions
  function preload() {
    this.isStarted = false;
    this.load.baseURL = 'assets/';
    this.load.image('tileset', '[Base]BaseChip_pipo.png');
    this.load.tilemapTiledJSON('map', 'mazemap-final.json');
    this.load.spritesheet('characters', 'characters.png', {
      frameWidth: 60,
      frameHeight: 60,
    });
  }
  
  function create() {
    // map
    const map = this.make.tilemap({ key: "map" });
    map.addTilesetImage("tileset", "tileset");
    map.layers.forEach((layer, index) => {
      const layerCreated = map.createLayer(index, 'tileset', 0, 0);
      layerCreated.scale = 1.5;
    });

    // text 
    this.add.text(80, 40, "Finish!",
      { fontSize: 25 }
    );


    this.socket = socket;
    let playerSprite;
    let othersSprite = {};
    let playerSelectedChar = charactersJson.find(c => c.name === selectedChar);
    let othersSelectedChar = {};
    let othersPlayerName;
    let gridEngineConfig = { characters:[] };

    this.socket.on('user_start', players => {
      this.isStarted = true;
      setIsStartedState(true);
      gridEngineConfig.characters = players.map(player => {
        if(player.id === this.socket.id){
          // add main player
          playerSprite = this.physics.add.sprite(0, 0, 'characters');
          playerSprite.setFrame(playerSelectedChar.stopFrame['down']);
          this.cameras.main.startFollow(playerSprite, true);
          this.cameras.main.setFollowOffset(-playerSprite.width, -playerSprite.height);

          const { animateFrame } = playerSelectedChar;
          createPlayerAnimation.call(this, 'up', animateFrame.up[0], animateFrame.up[1]);
          createPlayerAnimation.call(this, 'right', animateFrame.right[0], animateFrame.right[1]);
          createPlayerAnimation.call(this, 'down', animateFrame.down[0], animateFrame.down[1]);
          createPlayerAnimation.call(this, 'left', animateFrame.left[0], animateFrame.left[1]);

          return {
            id: 'characters',
            sprite: playerSprite,
            startPosition: { x: player.position.x, y: player.position.y },
            speed: 4,
            walkingAnimationMapping: playerSelectedChar.walkingAnimationMapping,
          }
        } else {
          // add other players
          othersSelectedChar[player.id] = charactersJson.find(c => c.name === player.selectedChar);
          othersSprite[player.id] = this.add.sprite(0, 0, "characters");
          othersSprite[player.id].setFrame(othersSelectedChar[player.id].stopFrame['down']);

          othersPlayerName = this.add.text(0, -20, player.username);
          const container = this.add.container(0, 0, [
            othersSprite[player.id],
            othersPlayerName,
          ]);
          return {
            id: player.id,
            sprite: othersSprite[player.id],
            startPosition: { x: player.position.x, y: player.position.y },
            speed: 4,
            container,
            walkingAnimationMapping: othersSelectedChar[player.id].walkingAnimationMapping
          }
        }
      });

      this.gridEngine.create(map, gridEngineConfig);
      

      // watch the movement of all characters
      this.gridEngine
        .positionChangeFinished()
        .subscribe(({ charId, exitTile, enterTile }) => {
          if(charId === 'characters'){
            socket.emit('set_player_position', {
              id: this.socket.id,
              position: {
                x: enterTile.x,
                y: enterTile.y
              }
            });
          }
      });
    });

    this.socket.on('position_update', data => {
      const { id, position } = data;
      // move the character
      if(id !== this.socket.id){
        console.log(id, position, 'received');
        this.gridEngine.moveTo(id, { x: position.x, y: position.y });
      }
    });
  }
  
  function update() {
    if(this.isStarted){
      const cursors = this.input.keyboard.createCursorKeys();
      if (cursors.left.isDown) {
        this.gridEngine.move("characters", "left");
      } else if (cursors.right.isDown) {
        this.gridEngine.move("characters", "right");
      } else if (cursors.up.isDown) {
        this.gridEngine.move("characters", "up");
      } else if (cursors.down.isDown) {
        this.gridEngine.move("characters", "down");
      }
    }
  }

  function createPlayerAnimation(
    name,
    startFrame,
    endFrame,
  ) {
    this.anims.create({
      key: name,
      frames: this.anims.generateFrameNumbers("characters", {
        start: startFrame,
        end: endFrame,
      }),
      frameRate: 10,
      repeat: -1,
      yoyo: true,
    });
  }

  const start = () => {
    socket.emit('game_start');
  };

  
  return <div>
    <button onClick={() => start()}>start</button>
    { isStartedState ? null : <Users socket={socket} /> }
    <div id="game-content" className={isStartedState ? 'started' : '' } />
  </div>;
};

export default GameComponent;