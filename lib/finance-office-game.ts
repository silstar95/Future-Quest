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

  public onLocationChange?: (location: string) => void
  public onTaskSelect?: (taskId: string) => void
  public onTaskReview?: (taskId: string) => void

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
  }) {
    this.tasks = data.tasks || []
    this.onLocationChange = data.onLocationChange
    this.onTaskSelect = data.onTaskSelect
    this.onTaskReview = data.onTaskReview

    // Define room positions for finance office layout
    this.rooms = [
      {
        id: "lobby",
        name: "Finance Hub",
        x: 400,
        y: 500,
        width: 120,
        height: 80,
        description: "Welcome to the finance department",
      },
      {
        id: "analysis",
        name: "Analysis Center",
        x: 150,
        y: 200,
        width: 140,
        height: 100,
        description: "Financial health check and analysis",
        taskId: "1",
      },
      {
        id: "investment",
        name: "Investment Office",
        x: 600,
        y: 200,
        width: 140,
        height: 100,
        description: "Strategic investment planning",
        taskId: "2",
      },
      {
        id: "treasury",
        name: "Treasury Department",
        x: 150,
        y: 350,
        width: 140,
        height: 100,
        description: "Budget planning and treasury",
        taskId: "3",
      },
      {
        id: "research",
        name: "Research Lab",
        x: 600,
        y: 350,
        width: 140,
        height: 100,
        description: "Financial analysis and forecasting",
        taskId: "4",
      },
      {
        id: "risk",
        name: "Risk Management",
        x: 375,
        y: 300,
        width: 140,
        height: 100,
        description: "Risk assessment and crisis management",
        taskId: "5",
      },
    ]
  }

  preload() {
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
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xf0fdf4)
    bg.setOrigin(0, 0)

    // Create rooms
    this.createRooms()

    // Create character
    this.createCharacter()

    // Set up input controls
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.wasd = this.input.keyboard?.addKeys("W,S,A,D") as any

    // Camera follows the character
    this.cameras.main.startFollow(this.character!)
    this.cameras.main.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height)

    // Add room interaction zones
    this.createInteractionZones()
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
  }

  createRooms() {
    this.rooms.forEach((room) => {
      const container = this.add.container(room.x, room.y)

      // Room background (finance theme colors)
      const roomBg = this.add.rectangle(0, 0, room.width, room.height, 0x10b981, 0.3)
      roomBg.setStrokeStyle(2, 0x059669)
      container.add(roomBg)

      // Room label
      const label = this.add
        .text(0, -room.height / 2 + 15, room.name, {
          fontSize: "14px",
          fontFamily: "Arial",
          color: "#059669",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
      container.add(label)

      // Task indicator if room has a task
      if (room.taskId) {
        const task = this.tasks.find((t) => t.id === room.taskId)
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
      }

      // Room icon
      const icons = {
        lobby: "🏢",
        analysis: "📊",
        investment: "💰",
        treasury: "🏦",
        research: "📈",
        risk: "⚖️",
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

    // Check room proximity for auto-entry with throttling
    const currentTime = this.time.now
    if (currentTime - this.lastProximityCheck > this.proximityCheckDelay) {
      this.checkRoomProximity()
      this.lastProximityCheck = currentTime
    }
  }

  checkRoomProximity() {
    if (!this.character) return

    const characterX = this.character.x
    const characterY = this.character.y

    // Find the closest room
    let closestRoom: RoomData | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    this.rooms.forEach((room) => {
      const distance = Phaser.Math.Distance.Between(characterX, characterY, room.x, room.y)
      if (distance < closestDistance) {
        closestDistance = distance
        closestRoom = room
      }
    })

    // If character is close enough to a room (within 80 pixels), enter it
    if (closestRoom && closestDistance < 80) {
      if (this.currentRoom !== closestRoom.id) {
        this.currentRoom = closestRoom.id

        // Notify location change
        if (this.onLocationChange) {
          this.onLocationChange(closestRoom.id)
        }

        // Auto-trigger task if room has one and character is very close (within 50 pixels)
        if (closestDistance < 50 && closestRoom.taskId) {
          const task = this.tasks.find((t) => t.id === closestRoom.taskId)
          if (task) {
            // Add a small delay to prevent immediate triggering
            this.time.delayedCall(300, () => {
              if (task.isCompleted && this.onTaskReview) {
                this.onTaskReview(task.id)
              } else if (!task.isCompleted && this.onTaskSelect) {
                this.onTaskSelect(task.id)
              }
            })
          }
        }
      }
    }
  }

  enterRoom(roomId: string) {
    const room = this.rooms.find((r) => r.id === roomId)
    if (!room) return

    // Move character to room
    if (this.character) {
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
      this.tweens.add({
        targets: this.character,
        x: room.x,
        y: room.y,
        duration: 500,
        ease: "Power2",
      })
      this.currentRoom = roomId
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
