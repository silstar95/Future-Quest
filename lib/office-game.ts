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
    this.rooms = [
      {
        id: "lobby",
        name: "Lobby",
        x: 450,
        y: 550,
        width: 120,
        height: 80,
        description: "Welcome area and reception",
      },
      {
        id: "whiteboard",
        name: "Strategy Room",
        x: 150,
        y: 200,
        width: 140,
        height: 100,
        description: "Brand strategy and planning",
        taskId: "task-1",
      },
      {
        id: "research",
        name: "Research Room",
        x: 600,
        y: 200,
        width: 140,
        height: 100,
        description: "Market research and analytics",
        taskId: "task-2",
      },
      {
        id: "creative",
        name: "Creative Studio",
        x: 150,
        y: 350,
        width: 140,
        height: 100,
        description: "Design and content creation",
        taskId: "task-3",
      },
      {
        id: "media",
        name: "Media Room",
        x: 600,
        y: 350,
        width: 140,
        height: 100,
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

    // Create rooms
    this.createRooms()

    // Create cat character
    this.createCat()

    // Set up input controls
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.wasd = this.input.keyboard?.addKeys("W,S,A,D") as any

    // Camera follows the cat
    this.cameras.main.startFollow(this.cat!)
    this.cameras.main.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height)

    // Add room interaction zones
    this.createInteractionZones()
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

    cat.setPosition(400, 500) // Start in lobby
    this.cat = cat

    // Enable physics
    this.physics.add.existing(cat)
    const catBody = (cat as any).body as Phaser.Physics.Arcade.Body
    catBody.setCollideWorldBounds(true)
    catBody.setSize(30, 40)
  }

  createRooms() {
    this.rooms.forEach((room) => {
      const container = this.add.container(room.x, room.y)

      // Room background (semi-transparent)
      const roomBg = this.add.rectangle(0, 0, room.width, room.height, 0x4a0e2, 0.3)
      roomBg.setStrokeStyle(2, 0x2c5aa0)
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

    // Check room proximity for auto-entry
    this.checkRoomProximity()
  }

  checkRoomProximity() {
    if (!this.cat) return

    const catX = this.cat.x
    const catY = this.cat.y

    this.rooms.forEach((room) => {
      const distance = Phaser.Math.Distance.Between(catX, catY, room.x, room.y)
      if (distance < 60 && this.currentRoom !== room.id) {
        this.currentRoom = room.id
        if (this.onLocationChange) {
          this.onLocationChange(room.id)
        }
      }
    })
  }

  enterRoom(roomId: string) {
    const room = this.rooms.find((r) => r.id === roomId)
    if (!room) return

    // Move cat to room
    if (this.cat) {
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
      this.tweens.add({
        targets: this.cat,
        x: room.x,
        y: room.y,
        duration: 500,
        ease: "Power2",
      })
      this.currentRoom = roomId
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
