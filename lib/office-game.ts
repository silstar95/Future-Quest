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

const UNREACHABLE_AREAS = [
  // Top left corner
  { x: 0, y: 0, width: 44, height: 264 },
  // Top strip
  { x: 0, y: 0, width: 1024, height: 128 },
  // Left side bottom
  { x: 0, y: 398, width: 44, height: 690 },
  // Left middle section
  { x: 0, y: 662, width: 244, height: 426 },
  // Middle section
  { x: 244, y: 662, width: 400, height: 130 },
  // Right middle section
  { x: 710, y: 662, width: 314, height: 130 },
  // Bottom strip
  { x: 0, y: 1056, width: 1024, height: 32 },
  // Right side
  { x: 976, y: 0, width: 48, height: 1088 },
  // Additional unreachable areas
  { x: 106, y: 467, width: 800, height: 111 },
  { x: 176, y: 170, width: 596, height: 142 },
  { x: 446, y: 912, width: 130, height: 64 },
  { x: 512, y: 762, width: 64, height: 214 },
  { x: 780, y: 862, width: 126, height: 60 },
  { x: 780, y: 862, width: 58, height: 194 }
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

class OfficeScene extends Phaser.Scene {
  private cat?: Phaser.GameObjects.Graphics
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
  private collisionBodies!: Phaser.Physics.Arcade.StaticGroup
  private spaceKey?: Phaser.Input.Keyboard.Key
  private roomEntryMessage?: Phaser.GameObjects.Text
  private nearRoomId?: string
  private spaceKeyPressed = false

  public onLocationChange?: (location: string) => void
  public onTaskSelect?: (taskId: string) => void
  public onTaskReview?: (taskId: string) => void

  constructor() {
    super({ key: "OfficeScene" })
  }

  init(data: {
    tasks: TaskData[]
    completedTasks: string[]
    currentTask?: TaskData
    onLocationChange?: (location: string) => void
    onTaskSelect?: (taskId: string) => void
    onTaskReview?: (taskId: string) => void
  }) {
    this.tasks = data.tasks
    this.onLocationChange = data.onLocationChange
    this.onTaskSelect = data.onTaskSelect
    this.onTaskReview = data.onTaskReview

    // Define room positions based on the office layout
    // Positions are scaled to match the canvas size (888x596)
    this.rooms = [
      {
        id: "lobby",
        name: "Lobby",
        x: 433, // 500 * SCALE_X
        y: 328, // 600 * SCALE_Y
        width: 104, // 120 * SCALE_X
        height: 44, // 80 * SCALE_Y
        description: "Welcome area and reception",
      },
      {
        id: "whiteboard",
        name: "Strategy Room",
        x: 357, // 43 + 628/2 (center of the room area)
        y: 82, // 70 + 24/2 (center of the room area)
        width: 628, // 772 * SCALE_X - 50 * SCALE_X
        height: 24, // 170 * SCALE_Y - 128 * SCALE_Y
        description: "Brand strategy and planning",
        taskId: "task-1",
      },
      {
        id: "research",
        name: "Research Room",
        x: 759, // 675 + 169/2 (center of the room area)
        y: 120, // 87 + 67/2 (center of the room area)
        width: 169, // 972 * SCALE_X - 778 * SCALE_X
        height: 67, // 280 * SCALE_Y - 158 * SCALE_Y
        description: "Market research and analytics",
        taskId: "task-2",
      },
      {
        id: "creative",
        name: "Creative Studio",
        x: 784, // 730 + 108/2 (center of the room area)
        y: 534, // 506 + 57/2 (center of the room area)
        width: 108, // 974 * SCALE_X - 842 * SCALE_X
        height: 57, // 1028 * SCALE_Y - 924 * SCALE_Y
        description: "Design and content creation",
        taskId: "task-3",
      },
      {
        id: "media",
        name: "Media Room",
        x: 299, // 212 + 175/2 (center of the room area)
        y: 507, // 435 + 144/2 (center of the room area)
        width: 175, // 444 * SCALE_X - 244 * SCALE_X
        height: 144, // 1056 * SCALE_Y - 794 * SCALE_Y
        description: "PR and media relations",
        taskId: "task-5",
      },
    ]
  }

  preload() {
    // Load office background
    this.load.image("office-bg", "/images/office-background.png")

    // Create particle texture for interactions
    this.load.image(
      "particle",
      "data:image/svg+xml;base64;" +
        btoa(`
        <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
          <circle cx="4" cy="4" r="4" fill="#FFD700"/>
        </svg>
      `),
    )
  }

  create() {
    // Add office background
    const bg = this.add.image(0, 0, "office-bg").setOrigin(0, 0)
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height)

    // Create collision boundaries for unreachable areas
    this.createCollisionBoundaries()

    // Create rooms
    this.createRooms()

    // Create cat character
    this.createCat()

    // Set up input controls
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.wasd = this.input.keyboard?.addKeys("W,S,A,D") as any
    this.spaceKey = this.input.keyboard?.addKey("SPACE")

    // Camera follows the cat
    this.cameras.main.startFollow(this.cat!)
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
    UNREACHABLE_AREAS.forEach(area => {
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

  // Helper function to check if cat bounds overlap with unreachable areas
  isCatInUnreachableArea(catX: number, catY: number): boolean {
    const catWidth = 30
    const catHeight = 40
    const catLeft = catX - catWidth / 2
    const catRight = catX + catWidth / 2
    const catTop = catY - catHeight / 2
    const catBottom = catY + catHeight / 2
    
    return UNREACHABLE_AREAS.some(area => {
      // Scale the area coordinates to match the canvas size
      const scaledX = area.x * SCALE_X
      const scaledY = area.y * SCALE_Y
      const scaledWidth = area.width * SCALE_X
      const scaledHeight = area.height * SCALE_Y
      
      const areaRight = scaledX + scaledWidth
      const areaBottom = scaledY + scaledHeight
      
      // Check for overlap between cat bounds and area bounds
      return !(catLeft >= areaRight || catRight <= scaledX || 
               catTop >= areaBottom || catBottom <= scaledY)
    })
  }

  createCat() {
    const cat = this.add.graphics()

    // Main body (orange)
    cat.fillStyle(0xff8c42)
    cat.fillEllipse(0, 0, 30, 40) // Body

    // Belly (lighter orange)
    cat.fillStyle(0xffb366)
    cat.fillEllipse(0, 3, 20, 28) // Belly

    // Head
    cat.fillStyle(0xff8c42)
    cat.fillCircle(0, -25, 15) // Head

    // Ears
    cat.fillStyle(0xff8c42)
    cat.fillTriangle(-12, -30, -8, -38, -4, -30) // Left ear
    cat.fillTriangle(4, -30, 8, -38, 12, -30) // Right ear

    // Inner ears (pink)
    cat.fillStyle(0xffb3ba)
    cat.fillTriangle(-9, -32, -7, -35, -6, -32) // Left inner ear
    cat.fillTriangle(6, -32, 7, -35, 9, -32) // Right inner ear

    // Eyes (closed/happy)
    cat.lineStyle(2, 0x000000)
    cat.beginPath()
    cat.arc(-5, -28, 2, 0.2, Math.PI - 0.2) // Left eye
    cat.strokePath()
    cat.beginPath()
    cat.arc(5, -28, 2, 0.2, Math.PI - 0.2) // Right eye
    cat.strokePath()

    // Nose
    cat.fillStyle(0xff69b4)
    cat.fillTriangle(0, -23, -1, -21, 1, -21)

    // Mouth
    cat.lineStyle(1, 0x000000)
    cat.beginPath()
    cat.arc(-2, -19, 2, 0, Math.PI)
    cat.strokePath()
    cat.beginPath()
    cat.arc(2, -19, 2, 0, Math.PI)
    cat.strokePath()

    // Whiskers
    cat.lineStyle(1, 0x000000)
    cat.lineBetween(-18, -25, -12, -24)
    cat.lineBetween(-18, -22, -12, -22)
    cat.lineBetween(12, -24, 18, -25)
    cat.lineBetween(12, -22, 18, -22)


    // Paws
    cat.fillStyle(0xff8c42)
    cat.fillCircle(-8, 18, 4) // Left front paw
    cat.fillCircle(8, 18, 4) // Right front paw
    cat.fillCircle(-5, 15, 3) // Left back paw
    cat.fillCircle(5, 15, 3) // Right back paw

    cat.setPosition(433, 328) // Start in lobby (scaled coordinates)
    this.cat = cat

    // Enable physics
    this.physics.add.existing(cat)
    const catBody = (cat as any).body as Phaser.Physics.Arcade.Body
    catBody.setCollideWorldBounds(true)
    catBody.setSize(30, 40)
    
    // Add collision with unreachable areas
    this.physics.add.collider(cat, this.collisionBodies)
    
    // Visualize cat collision bounds in debug mode
    if (DEBUG_COLLISION_AREAS) {
      const bounds = this.add.rectangle(
        cat.x,
        cat.y,
        30, // cat collision width
        40, // cat collision height
        0x00ff00, // Green color
        0.3 // Semi-transparent
      )
      bounds.setStrokeStyle(2, 0x00ff00)
      
      // Make bounds follow the cat
      this.tweens.add({
        targets: bounds,
        x: cat.x,
        y: cat.y,
        duration: 0,
        repeat: -1,
        onUpdate: () => {
          bounds.setPosition(cat.x, cat.y)
        }
      })
    }
  }

  createRooms() {
    this.rooms.forEach((room) => {
      const container = this.add.container(room.x, room.y)

      // Only show room elements in debug mode
      if (DEBUG_COLLISION_AREAS) {
        // Room background (green in debug mode)
        const roomBg = this.add.rectangle(
          0, 
          0, 
          room.width, 
          room.height, 
          0x00ff00, // Green
          0.3 // More visible in debug mode
        )
        roomBg.setStrokeStyle(1, 0x00ff00, 1)
        container.add(roomBg)

        // Room label
        const label = this.add
          .text(0, -room.height / 2 + 30, room.name, {
            fontSize: "14px",
            fontFamily: "Arial",
            color: "#ffffff",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
        container.add(label)

        // Task indicator if room has a task
        const task = this.tasks.find((t) => t.location === room.id)
        if (task) {
          const isCompleted = task.isCompleted
          const indicator = this.add.circle(
            room.width / 2 - 15,
            -room.height / 2 + 15,
            8,
            isCompleted ? 0x22c55e : 0xef4444,
          )
          indicator.setStrokeStyle(2, 0xffffff)
          container.add(indicator)

          const icon = this.add
            .text(room.width / 2 - 15, -room.height / 2 + 15, isCompleted ? "✓" : "!", {
              fontSize: "12px",
              color: "#ffffff",
              fontStyle: "bold",
            })
            .setOrigin(0.5)
          container.add(icon)
        }

        // Room icon
        const icons = {
          lobby: "🏢",
          whiteboard: "📋",
          research: "📊",
          creative: "🎨",
          media: "📺",
        }
        const roomIcon = this.add.text(-room.width / 2 + 20, room.height / 2 - 20, icons[room.id as keyof typeof icons], {
          fontSize: "20px",
        })
        container.add(roomIcon)
      }

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

  createDebugDisplay() {
    const debugText = this.add.text(10, 10, '', {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    })
    debugText.setScrollFactor(0) // Keep it fixed on screen
    debugText.name = 'debug-text'
    
    // Update debug info every frame
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.cat && debugText.active) {
          const catX = Math.round(this.cat.x)
          const catY = Math.round(this.cat.y)
          const inUnreachable = this.isCatInUnreachableArea(catX, catY)
          debugText.setText([
            `Cat Position: (${catX}, ${catY})`,
            `In Unreachable Area: ${inUnreachable ? 'YES' : 'NO'}`,
            `Canvas Size: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`,
            `Scale Factors: X=${SCALE_X.toFixed(3)}, Y=${SCALE_Y.toFixed(3)}`
          ])
        }
      },
      loop: true
    })
  }

  update() {
    if (!this.cat || !this.cursors || !this.wasd) return

    const catBody = (this.cat as any).body as Phaser.Physics.Arcade.Body
    const speed = 200

    // Reset velocity
    catBody.setVelocity(0)

    // Handle keyboard input
    if (this.cursors.left?.isDown || this.wasd.A.isDown) {
      catBody.setVelocityX(-speed)
    } else if (this.cursors.right?.isDown || this.wasd.D.isDown) {
      catBody.setVelocityX(speed)
    }

    if (this.cursors.up?.isDown || this.wasd.W.isDown) {
      catBody.setVelocityY(-speed)
    } else if (this.cursors.down?.isDown || this.wasd.S.isDown) {
      catBody.setVelocityY(speed)
    }

    // Normalize diagonal movement
    if (catBody.velocity.x !== 0 && catBody.velocity.y !== 0) {
      catBody.velocity.normalize().scale(speed)
    }

    // Check if cat is trying to enter unreachable area and provide visual feedback
    if (DEBUG_COLLISION_AREAS && this.cat) {
      const nextX = this.cat.x + catBody.velocity.x * 0.016 // 16ms frame time
      const nextY = this.cat.y + catBody.velocity.y * 0.016
      
      if (this.isCatInUnreachableArea(nextX, nextY)) {
        // Add a warning indicator when trying to enter unreachable area
        if (!this.children.list.some(child => child.name === 'collision-warning')) {
          const warning = this.add.text(this.cat.x, this.cat.y - 50, '⚠️ COLLISION', {
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

    // Check room proximity for manual entry
    this.checkRoomProximity()
    
    // Handle space key for room entry
    if (this.spaceKey?.isDown && !this.spaceKeyPressed && this.nearRoomId) {
      this.spaceKeyPressed = true
      this.enterRoom(this.nearRoomId)
      this.hideRoomEntryMessage()
    } else if (!this.spaceKey?.isDown) {
      this.spaceKeyPressed = false
    }
  }

  checkRoomProximity() {
    if (!this.cat) return

    const catX = this.cat.x
    const catY = this.cat.y
    let foundNearRoom = false

    this.rooms.forEach((room) => {
      // Check if cat is within room bounds
      const roomLeft = room.x - room.width / 2
      const roomRight = room.x + room.width / 2
      const roomTop = room.y - room.height / 2
      const roomBottom = room.y + room.height / 2

      if (catX >= roomLeft && catX <= roomRight && catY >= roomTop && catY <= roomBottom) {
        if (this.nearRoomId !== room.id) {
          this.nearRoomId = room.id
          this.showRoomEntryMessage(room.name)
        }
        foundNearRoom = true
      }
    })

    if (!foundNearRoom && this.nearRoomId) {
      this.hideRoomEntryMessage()
      this.nearRoomId = undefined
    }
  }

  showRoomEntryMessage(roomName: string) {
    if (this.roomEntryMessage) {
      this.roomEntryMessage.destroy()
    }

    this.roomEntryMessage = this.add.text(
      this.cameras.main.width / 2,
      100,
      `You've reached ${roomName}! Press SPACE to enter.`,
      {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
        fontStyle: 'bold'
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

    // Move cat to room (with safety check)
    if (this.cat && !this.isPositionUnreachable(room.x, room.y)) {
      this.tweens.add({
        targets: this.cat,
        x: room.x,
        y: room.y,
        duration: 500,
        ease: "Power2",
      })
    }

    this.currentRoom = roomId

    // Check if room has a task
    const task = this.tasks.find((t) => t.location === roomId)
    if (task) {
      if (task.isCompleted && this.onTaskReview) {
        // Allow reviewing completed tasks
        this.onTaskReview(task.id)
      } else if (this.onTaskSelect) {
        // Start new task
        this.onTaskSelect(task.id)
      }
    }

    if (this.onLocationChange) {
      this.onLocationChange(roomId)
    }
  }

  public moveCatToRoom(roomId: string) {
    const room = this.rooms.find((r) => r.id === roomId)
    if (room && this.cat) {
      // Ensure the target position is not in an unreachable area
      if (!this.isPositionUnreachable(room.x, room.y)) {
        this.tweens.add({
          targets: this.cat,
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
}

export class OfficeGame {
  private game: Phaser.Game
  private scene?: OfficeScene
  public onLocationChange?: (location: string) => void
  public onTaskSelect?: (taskId: string) => void
  public onTaskReview?: (taskId: string) => void

  constructor(parent: HTMLElement, tasks: TaskData[], completedTasks: string[], currentTask?: TaskData) {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: parent.clientWidth,
      height: parent.clientHeight,
      parent: parent,
      backgroundColor: "#f0f0f0",
      scene: OfficeScene,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    }

    this.game = new Phaser.Game(config)
    this.scene = this.game.scene.getScene("OfficeScene") as OfficeScene

    // Mark completed tasks
    const tasksWithCompletion = tasks.map((task) => ({
      ...task,
      isCompleted: completedTasks.includes(task.id),
    }))

    this.game.scene.start("OfficeScene", {
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
    })
  }

  public moveCatToRoom(roomId: string) {
    if (this.scene) {
      this.scene.moveCatToRoom(roomId)
    }
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true)
    }
  }
}
