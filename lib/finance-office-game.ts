import * as Phaser from "phaser"

interface RoomData {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  description: string
  taskId?: string
}

interface TaskData {
  id: string
  title: string
  role: string
  location: string
  isCompleted: boolean
  data?: any
}

// Define unreachable areas as collision boundaries for finance office
const UNREACHABLE_AREAS = [
  // Right side top (adjusted x position)
  { x: 447.825, y: 0, width: 49.45, height: 196.65 }, // 462.55 - 49.45/2, moved right 10px
  // Right side middle (adjusted x position)
  { x: 447.825, y: 309.56, width: 49.45, height: 447.44 }, // 462.55 - 49.45/2, cut top 20px, moved right 10px
  // Right side bottom (adjusted x position)
  { x: 447.825, y: 884, width: 49.45, height: 264 }, // 462.55 - 49.45/2, moved down 60px total, moved right 10px
  // Bottom strip left (adjusted x position)
  { x: -20, y: 490.38, width: 236.16, height: 34.47 }, // 0 - 20
  // Bottom strip right (adjusted x position)
  { x: 319, y: 490.38, width: 685, height: 34.47 }, // 339 - 20
  // Left side
  { x: 0, y: 0, width: 29.26, height: 1088 },
  // Top strip
  { x: 0, y: 0, width: 1024, height: 30 },
  // Right side
  { x: 940.29, y: 0, width: 27.71, height: 1088 },
  // Bottom strip
  { x: 0, y: 990.92, width: 1024, height: 97.08 }
]

// Debug mode to show collision boundaries (set to true to visualize)
const DEBUG_COLLISION_AREAS = false

// Coordinate system conversion factors
const ORIGINAL_WIDTH = 1024
const ORIGINAL_HEIGHT = 1088
const CANVAS_WIDTH = 888
const CANVAS_HEIGHT = 596

// Calculate scaling factors
const SCALE_X = CANVAS_WIDTH / ORIGINAL_WIDTH
const SCALE_Y = CANVAS_HEIGHT / ORIGINAL_HEIGHT

// Original room definitions (in original coordinate system)
const ROOM_DEFINITIONS_ORIGINAL = [
  {
    id: "risk",
    name: "Risk Management",
    x: 179.915, // 29.24 + 301.35/2 (center of the room area)
    y: 757.555, // 620.43 + 274.25/2 (center of the room area)
    width: 301.35,
    height: 274.25,
    description: "Risk assessment and crisis management",
    taskId: "5",
  },
  {
    id: "research-analysis",
    name: "Research & Analysis",
    x: 179.915, // 29.24 + 301.35/2 (center of the room area)
    y: 217.05, // 52.45 + 331.2/2 (center of the room area)
    width: 301.35,
    height: 331.2,
    description: "Research and analysis center",
    // No taskId here since R and A keys will handle specific tasks
  },
  {
    id: "treasury",
    name: "Treasury Department",
    x: 785.84, // 675.42 + 320.84/2 (center of the room area) - 50px
    y: 217.05, // 52.45 + 331.2/2 (center of the room area)
    width: 320.84,
    height: 331.2,
    description: "Budget planning and treasury",
    taskId: "3",
  },
  {
    id: "investments",
    name: "Investment Office",
    x: 785.84, // 675.42 + 320.84/2 (center of the room area) - 50px
    y: 714.84, // 549.99 + 329.7/2 (center of the room area)
    width: 320.84,
    height: 329.7,
    description: "Strategic investment planning",
    taskId: "2",
  },
]

class FinanceOfficeScene extends Phaser.Scene {
  private character?: Phaser.GameObjects.Graphics
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd?: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }
  private rooms: RoomData[] = []
  private tasks: TaskData[] = []
  private roomSprites: Map<string, Phaser.GameObjects.Container> = new Map()
  private currentRoom = "lobby"
  private lastProximityCheck = 0
  private proximityCheckDelay = 500 // Check every 500ms to prevent spam
  private collisionBodies!: Phaser.Physics.Arcade.StaticGroup
  private rKey?: Phaser.Input.Keyboard.Key
  private aKey?: Phaser.Input.Keyboard.Key
  private spaceKey?: Phaser.Input.Keyboard.Key
  private roomEntryMessage?: Phaser.GameObjects.Text
  private nearRoomId?: string
  private rKeyPressed = false
  private aKeyPressed = false
  private spaceKeyPressed = false

  public onLocationChange?: (location: string) => void
  public onTaskSelect?: (taskId: string) => void
  public onTaskReview?: (taskId: string) => void
  public onShowTaskSelection?: (roomId: string, tasks: TaskData[]) => void

  constructor() {
    super({ key: "FinanceOfficeScene" })
  }

  init(data: {
    tasks: TaskData[]
    completedTasks: string[]
    currentTask?: TaskData
    onLocationChange?: (location: string) => void
    onTaskSelect?: (taskId: string) => void
    onTaskReview?: (taskId: string) => void
    onShowTaskSelection?: (roomId: string, tasks: TaskData[]) => void
  }) {
    this.tasks = data.tasks || []
    this.onLocationChange = data.onLocationChange
    this.onTaskSelect = data.onTaskSelect
    this.onTaskReview = data.onTaskReview
    this.onShowTaskSelection = data.onShowTaskSelection

    // Define room positions for finance office layout (scaled from original coordinates)
    this.rooms = ROOM_DEFINITIONS_ORIGINAL.map(room => ({
      id: room.id,
      name: room.name,
      x: room.x * SCALE_X,
      y: room.y * SCALE_Y,
      width: room.width * SCALE_X,
      height: room.height * SCALE_Y,
      description: room.description,
      taskId: room.taskId,
    }))
  }

  preload() {
    // Load finance office background
    this.load.image("finance-bg", "/images/finance.jpg")

    // Create particle texture for interactions
    this.load.image(
      "particle",
      "data:image/svg+xml;base64," +
        btoa(`
        <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
          <circle cx="4" cy="4" r="4" fill="#10B981"/>
        </svg>
      `),
    )
  }

  create() {
    // Add finance office background
    const bg = this.add.image(0, 0, "finance-bg").setOrigin(0, 0)
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height)

    // Create collision boundaries for unreachable areas
    this.createCollisionBoundaries()

    // Create rooms
    this.createRooms()

    // Create character
    this.createCharacter()

    // Set up input controls
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.wasd = this.input.keyboard?.addKeys("W,S,A,D") as any
    this.rKey = this.input.keyboard?.addKey("R")
    this.aKey = this.input.keyboard?.addKey("A")
    this.spaceKey = this.input.keyboard?.addKey("SPACE")

    // Camera follows the character
    this.cameras.main.startFollow(this.character!)
    this.cameras.main.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height)

    // Add room interaction zones
    this.createInteractionZones()

    // Add debug info display
    if (DEBUG_COLLISION_AREAS) {
      this.createDebugDisplay()
    }
  }

  createCollisionBoundaries() {
    // Create a static group for collision bodies
    this.collisionBodies = this.physics.add.staticGroup()

    // Add invisible collision bodies for unreachable areas
    UNREACHABLE_AREAS.forEach((area, index) => {
      // Scale the coordinates and dimensions to match the canvas size
      const scaledX = area.x * SCALE_X
      const scaledY = area.y * SCALE_Y
      const scaledWidth = area.width * SCALE_X
      const scaledHeight = area.height * SCALE_Y
      
      const collisionBody = this.add.rectangle(
        scaledX + scaledWidth / 2,
        scaledY + scaledHeight / 2,
        scaledWidth,
        scaledHeight,
        DEBUG_COLLISION_AREAS ? 0xff0000 : 0x000000, // Red if debug mode, invisible otherwise
        DEBUG_COLLISION_AREAS ? 0.3 : 0 // Semi-transparent red if debug mode
      )
      
      // Add position and size text on each area in debug mode
      if (DEBUG_COLLISION_AREAS) {
        const infoText = this.add.text(
          scaledX + scaledWidth / 2,
          scaledY + scaledHeight / 2,
          `Area ${index + 1}\n(${Math.round(scaledX)}, ${Math.round(scaledY)})\n${Math.round(scaledWidth)}x${Math.round(scaledHeight)}`,
          {
            fontSize: "8px",
            color: "#ffffff",
            fontStyle: "bold",
            backgroundColor: "#000000",
            padding: { x: 2, y: 2 },
          }
        )
        infoText.setOrigin(0.5)
      }
      
      // Enable physics for collision detection
      this.physics.add.existing(collisionBody, true)
      this.collisionBodies.add(collisionBody)
    })
  }

  // Helper function to check if a position is in an unreachable area
  isPositionUnreachable(x: number, y: number): boolean {
    return UNREACHABLE_AREAS.some(area => {
      // Scale the area coordinates to match the canvas size
      const scaledX = area.x * SCALE_X
      const scaledY = area.y * SCALE_Y
      const scaledWidth = area.width * SCALE_X
      const scaledHeight = area.height * SCALE_Y
      
      return x >= scaledX && x <= scaledX + scaledWidth &&
             y >= scaledY && y <= scaledY + scaledHeight
    })
  }

  // Helper function to check if character bounds overlap with unreachable areas
  isCharacterInUnreachableArea(characterX: number, characterY: number): boolean {
    const characterWidth = 30
    const characterHeight = 40
    const characterLeft = characterX - characterWidth / 2
    const characterRight = characterX + characterWidth / 2
    const characterTop = characterY - characterHeight / 2
    const characterBottom = characterY + characterHeight / 2
    
    return UNREACHABLE_AREAS.some(area => {
      // Scale the area coordinates to match the canvas size
      const scaledX = area.x * SCALE_X
      const scaledY = area.y * SCALE_Y
      const scaledWidth = area.width * SCALE_X
      const scaledHeight = area.height * SCALE_Y
      
      const areaRight = scaledX + scaledWidth
      const areaBottom = scaledY + scaledHeight
      
      // Check for overlap between character bounds and area bounds
      return !(characterLeft >= areaRight || characterRight <= scaledX || 
               characterTop >= areaBottom || characterBottom <= scaledY)
    })
  }

  createDebugDisplay() {
    const debugText = this.add.text(10, 10, "", {
      fontSize: "10px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 5, y: 5 },
    })
    debugText.setScrollFactor(0) // Keep it fixed on screen
    debugText.name = "debug-text"
    
    // Update debug info every frame
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.character && debugText.active) {
          const characterX = Math.round(this.character.x)
          const characterY = Math.round(this.character.y)
          const inUnreachable = this.isCharacterInUnreachableArea(characterX, characterY)
          
          // Create detailed unreachable areas info
          const areasInfo = UNREACHABLE_AREAS.map((area, index) => {
            const scaledX = Math.round(area.x * SCALE_X)
            const scaledY = Math.round(area.y * SCALE_Y)
            const scaledWidth = Math.round(area.width * SCALE_X)
            const scaledHeight = Math.round(area.height * SCALE_Y)
            return `Area ${index + 1}: (${scaledX}, ${scaledY}) ${scaledWidth}x${scaledHeight}`
          }).join("\n")
          
          debugText.setText([
            `Character Position: (${characterX}, ${characterY})`,
            `In Unreachable Area: ${inUnreachable ? "YES" : "NO"}`,
            `Canvas Size: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`,
            `Scale Factors: X=${SCALE_X.toFixed(3)}, Y=${SCALE_Y.toFixed(3)}`,
            "",
            // "Unreachable Areas (Scaled):",
            // areasInfo,
          ])
        }
      },
      loop: true,
    })
  }

  createCharacter() {
    const character = this.add.graphics()

    // Main body (professional suit - dark blue)
    character.fillStyle(0x1e40af)
    character.fillEllipse(0, 0, 30, 40) // Body

    // Shirt (white)
    character.fillStyle(0xffffff)
    character.fillEllipse(0, -5, 20, 25) // Shirt

    // Tie (red)
    character.fillStyle(0xdc2626)
    character.fillRect(-3, -15, 6, 20) // Tie

    // Head (skin tone)
    character.fillStyle(0xfdbcb4)
    character.fillCircle(0, -25, 15) // Head

    // Hair (brown)
    character.fillStyle(0x92400e)
    character.fillEllipse(0, -32, 20, 12) // Hair

    // Eyes
    character.fillStyle(0x000000)
    character.fillCircle(-5, -28, 2) // Left eye
    character.fillCircle(5, -28, 2) // Right eye

    // Briefcase
    character.fillStyle(0x451a03)
    character.fillRect(15, -5, 8, 12) // Briefcase
    character.fillStyle(0xfbbf24)
    character.fillRect(16, -2, 6, 2) // Briefcase handle

    // Legs
    character.fillStyle(0x374151)
    character.fillRect(-8, 15, 6, 20) // Left leg
    character.fillRect(2, 15, 6, 20) // Right leg

    // Shoes
    character.fillStyle(0x000000)
    character.fillEllipse(-5, 35, 8, 4) // Left shoe
    character.fillEllipse(5, 35, 8, 4) // Right shoe

    character.setPosition(400, 500) // Start in lobby
    this.character = character

    // Enable physics
    this.physics.add.existing(character)
    const characterBody = (character as any).body as Phaser.Physics.Arcade.Body
    characterBody.setCollideWorldBounds(true)
    characterBody.setSize(30, 40)
    
    // Add collision with unreachable areas
    this.physics.add.collider(character, this.collisionBodies)
    
    // Visualize character collision bounds in debug mode
    if (DEBUG_COLLISION_AREAS) {
      const bounds = this.add.rectangle(
        character.x,
        character.y,
        30, // character collision width
        40, // character collision height
        0x00ff00, // Green color
        0.3 // Semi-transparent
      )
      bounds.setStrokeStyle(2, 0x00ff00)
      
      // Make bounds follow the character
      this.tweens.add({
        targets: bounds,
        x: character.x,
        y: character.y,
        duration: 0,
        repeat: -1,
        onUpdate: () => {
          bounds.setPosition(character.x, character.y)
        }
      })
    }
  }

  createRooms() {
    this.rooms.forEach((room) => {
      const container = this.add.container(room.x, room.y)

      // Hide room visuals - only keep interaction zones
      // Room background (finance theme colors) - HIDDEN
      // const roomBg = this.add.rectangle(0, 0, room.width, room.height, 0x10b981, 0.3)
      // roomBg.setStrokeStyle(2, 0x059669)
      // container.add(roomBg)

      // Room label - HIDDEN
      // const label = this.add
      //   .text(0, -room.height / 2 + 15, room.name, {
      //     fontSize: "14px",
      //     fontFamily: "Arial",
      //     color: "#059669",
      //     fontStyle: "bold",
      //   })
      //   .setOrigin(0.5)
      // container.add(label)

      // Task indicator if room has a task - HIDDEN
      // if (room.taskId) {
      //   const task = this.tasks.find((t) => t.id === room.taskId)
      //   if (task) {
      //     const isCompleted = task.isCompleted
      //     const indicator = this.add.circle(
      //       room.width / 2 - 15,
      //       -room.height / 2 + 15,
      //       8,
      //       isCompleted ? 0x22c55e : 0xef4444,
      //     )
      //     indicator.setStrokeStyle(2, 0xffffff)
      //     container.add(indicator)

      //     const icon = this.add
      //       .text(room.width / 2 - 15, -room.height / 2 + 15, isCompleted ? "✓" : "!", {
      //       fontSize: "12px",
      //       color: "#ffffff",
      //       fontStyle: "bold",
      //     })
      //     .setOrigin(0.5)
      //     container.add(icon)
      //   }
      // }

      // Room icon - HIDDEN
      // const icons = {
      //   lobby: "🏢",
      //   "research-analysis": "📈", // Research Lab
      //   investments: "💰", // Investment Office
      //   treasury: "🏦", // Treasury Department
      //   risk: "⚖️", // Risk Management
      // }
      // const roomIcon = this.add.text(-room.width / 2 + 20, room.height / 2 - 20, icons[room.id as keyof typeof icons], {
      //   fontSize: "20px",
      // })
      // container.add(roomIcon)

      this.roomSprites.set(room.id, container)
    })
  }

  createInteractionZones() {
    this.rooms.forEach((room) => {
      const zone = this.add.zone(room.x, room.y, room.width, room.height)
      zone.setInteractive()
      zone.setData("roomId", room.id)

      // Visual feedback on hover
      zone.on("pointerover", () => {
        const container = this.roomSprites.get(room.id)
        if (container) {
          this.tweens.add({
            targets: container,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            ease: "Power2",
          })
        }
      })

      zone.on("pointerout", () => {
        const container = this.roomSprites.get(room.id)
        if (container) {
          this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: "Power2",
          })
        }
      })

      zone.on("pointerdown", () => {
        this.enterRoom(room.id)
      })
    })
  }

  update() {
    if (!this.character || !this.cursors || !this.wasd) return

    const characterBody = (this.character as any).body as Phaser.Physics.Arcade.Body
    const speed = 200

    // Reset velocity
    characterBody.setVelocity(0)

    // Handle keyboard input
    if (this.cursors.left?.isDown || this.wasd.A.isDown) {
      characterBody.setVelocityX(-speed)
    } else if (this.cursors.right?.isDown || this.wasd.D.isDown) {
      characterBody.setVelocityX(speed)
    }

    if (this.cursors.up?.isDown || this.wasd.W.isDown) {
      characterBody.setVelocityY(-speed)
    } else if (this.cursors.down?.isDown || this.wasd.S.isDown) {
      characterBody.setVelocityY(speed)
    }

    // Normalize diagonal movement
    if (characterBody.velocity.x !== 0 && characterBody.velocity.y !== 0) {
      characterBody.velocity.normalize().scale(speed)
    }

    // Check room proximity for manual entry
    this.checkRoomProximity()

    // Handle R and A keys for Research & Analysis room
    if (this.rKey?.isDown && !this.rKeyPressed && this.nearRoomId === "research-analysis") {
      this.rKeyPressed = true
      if (this.onTaskSelect) {
        this.onTaskSelect("1") // Task ID for Research Lab
      }
      this.hideRoomEntryMessage()
    } else if (!this.rKey?.isDown) {
      this.rKeyPressed = false
    }

    if (this.aKey?.isDown && !this.aKeyPressed && this.nearRoomId === "research-analysis") {
      this.aKeyPressed = true
      if (this.onTaskSelect) {
        this.onTaskSelect("4") // Task ID for Analysis Center
      }
      this.hideRoomEntryMessage()
    } else if (!this.aKey?.isDown) {
      this.aKeyPressed = false
    }

    // Handle space key for room entry
    if (this.spaceKey?.isDown && !this.spaceKeyPressed && this.nearRoomId) {
      this.spaceKeyPressed = true
      
      // For rooms other than research-analysis, use the room's taskId
      if (this.nearRoomId !== "research-analysis") {
        const room = this.rooms.find(r => r.id === this.nearRoomId)
        if (room && room.taskId) {
          if (this.onTaskSelect) {
            this.onTaskSelect(room.taskId)
          }
        }
      }
      
      this.hideRoomEntryMessage()
    } else if (!this.spaceKey?.isDown) {
      this.spaceKeyPressed = false
    }

    // Check if character is trying to enter unreachable area and provide visual feedback
    if (DEBUG_COLLISION_AREAS && this.character) {
      const nextX = this.character.x + characterBody.velocity.x * 0.016 // 16ms frame time
      const nextY = this.character.y + characterBody.velocity.y * 0.016
      
      if (this.isCharacterInUnreachableArea(nextX, nextY)) {
        // Add a warning indicator when trying to enter unreachable area
        if (!this.children.list.some(child => child.name === 'collision-warning')) {
          const warning = this.add.text(this.character.x, this.character.y - 50, '⚠️ COLLISION', {
            fontSize: '12px',
            color: '#ff0000',
            fontStyle: 'bold'
          })
          warning.setOrigin(0.5)
          warning.name = 'collision-warning'
          
          // Remove warning after 1 second
          this.time.delayedCall(1000, () => {
            warning.destroy()
          })
        }
      }
    }
  }

  checkRoomProximity() {
    if (!this.character) return

    const characterX = this.character.x
    const characterY = this.character.y
    let foundNearRoom = false

    this.rooms.forEach((room) => {
      // Check if character is within room bounds
      const roomLeft = room.x - room.width / 2
      const roomRight = room.x + room.width / 2
      const roomTop = room.y - room.height / 2
      const roomBottom = room.y + room.height / 2

      if (characterX >= roomLeft && characterX <= roomRight && characterY >= roomTop && characterY <= roomBottom) {
        if (this.nearRoomId !== room.id) {
          this.nearRoomId = room.id
          if (room.id === "research-analysis") {
            this.showRoomEntryMessage(`You've reached ${room.name} - Press R for Research or A for Analysis`)
          } else {
            this.showRoomEntryMessage(`You've reached ${room.name} - Press SPACE to enter`)
          }
        }
        foundNearRoom = true
      }
    })

    if (!foundNearRoom && this.nearRoomId) {
      this.hideRoomEntryMessage()
      this.nearRoomId = undefined
    }
  }

  showRoomEntryMessage(message: string) {
    if (this.roomEntryMessage) {
      this.roomEntryMessage.destroy()
    }

    this.roomEntryMessage = this.add.text(
      this.cameras.main.width / 2,
      100,
      message,
      {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        fontStyle: "bold",
      }
    )
    this.roomEntryMessage.setOrigin(0.5)
    this.roomEntryMessage.setScrollFactor(0) // Keep it on screen
  }

  hideRoomEntryMessage() {
    if (this.roomEntryMessage) {
      this.roomEntryMessage.destroy()
      this.roomEntryMessage = undefined
    }
  }

  enterRoom(roomId: string) {
    const room = this.rooms.find((r) => r.id === roomId)
    if (!room) return

    // Move character to room (with safety check)
    if (this.character && !this.isPositionUnreachable(room.x, room.y)) {
      this.tweens.add({
        targets: this.character,
        x: room.x,
        y: room.y,
        duration: 500,
        ease: "Power2",
      })
    }

    this.currentRoom = roomId

    // Check if room has a task
    if (room.taskId) {
      const task = this.tasks.find((t) => t.id === room.taskId)
      if (task) {
        if (task.isCompleted && this.onTaskReview) {
          // Allow reviewing completed tasks
          this.onTaskReview(task.id)
        } else if (this.onTaskSelect) {
          // Start new task
          this.onTaskSelect(task.id)
        }
      }
    }

    if (this.onLocationChange) {
      this.onLocationChange(roomId)
    }
  }

  public moveCatToRoom(roomId: string) {
    const room = this.rooms.find((r) => r.id === roomId)
    if (room && this.character) {
      // Ensure the target position is not in an unreachable area
      if (!this.isPositionUnreachable(room.x, room.y)) {
        this.tweens.add({
          targets: this.character,
          x: room.x,
          y: room.y,
          duration: 500,
          ease: "Power2",
        })
        this.currentRoom = roomId
      } else {
        console.warn(`Room ${roomId} is positioned in an unreachable area`)
      }
    }
  }

  public updateTaskCompletion(completedTaskIds: string[]) {
    // Update task completion status
    this.tasks.forEach((task) => {
      task.isCompleted = completedTaskIds.includes(task.id)
    })

    // Update room indicators
    this.rooms.forEach((room) => {
      if (room.taskId) {
        const task = this.tasks.find((t) => t.id === room.taskId)
        const container = this.roomSprites.get(room.id)

        if (task && container) {
          // Find and update the indicator
          const indicator = container.list.find(
            (child) => child instanceof Phaser.GameObjects.Arc,
          ) as Phaser.GameObjects.Arc

          const icon = container.list.find(
            (child) => child instanceof Phaser.GameObjects.Text && (child.text === "✓" || child.text === "!"),
          ) as Phaser.GameObjects.Text

          if (indicator && icon) {
            const isCompleted = task.isCompleted
            indicator.fillColor = isCompleted ? 0x22c55e : 0xef4444
            icon.setText(isCompleted ? "✓" : "!")
          }
        }
      }
    })
  }
}

export class FinanceOfficeGame {
  private game: Phaser.Game
  private scene?: FinanceOfficeScene
  public onLocationChange?: (location: string) => void
  public onTaskSelect?: (taskId: string) => void
  public onTaskReview?: (taskId: string) => void
  public onShowTaskSelection?: (roomId: string, tasks: TaskData[]) => void

  constructor(parent: HTMLElement, tasks: TaskData[], completedTasks: string[], currentTask?: TaskData) {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: parent.clientWidth,
      height: parent.clientHeight,
      parent: parent,
      backgroundColor: "#f0fdf4",
      scene: FinanceOfficeScene,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    }

    this.game = new Phaser.Game(config)
    this.scene = this.game.scene.getScene("FinanceOfficeScene") as FinanceOfficeScene

    // Mark completed tasks
    const tasksWithCompletion = tasks.map((task) => ({
      ...task,
      isCompleted: completedTasks.includes(task.id),
    }))

    this.game.scene.start("FinanceOfficeScene", {
      tasks: tasksWithCompletion,
      completedTasks,
      currentTask,
      onLocationChange: (location: string) => {
        if (this.onLocationChange) {
          this.onLocationChange(location)
        }
      },
      onTaskSelect: (taskId: string) => {
        if (this.onTaskSelect) {
          this.onTaskSelect(taskId)
        }
      },
      onTaskReview: (taskId: string) => {
        if (this.onTaskReview) {
          this.onTaskReview(taskId)
        }
      },
      onShowTaskSelection: (roomId: string, tasks: TaskData[]) => {
        if (this.onShowTaskSelection) {
          this.onShowTaskSelection(roomId, tasks)
        }
      },
    })
  }

  public moveCatToRoom(roomId: string) {
    if (this.scene) {
      this.scene.moveCatToRoom(roomId)
    }
  }

  public updateTaskCompletion(completedTaskIds: string[]) {
    if (this.scene) {
      this.scene.updateTaskCompletion(completedTaskIds)
    }
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true)
    }
  }
}
