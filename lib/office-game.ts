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
  { x: -9, y: 25, width: 53, height: 239 },
  // Top strip
  { x: 21, y: 25, width: 1003, height: 103 },
  // Left side bottom
  { x: -9, y: 403, width: 53, height: 685 },
  // Left middle section
  { x: 21, y: 667, width: 223, height: 421 },
  // Middle section
  { x: 240, y: 657, width: 410, height: 135 },
  // Right middle section
  { x: 701, y: 657, width: 314, height: 135 },
  // Bottom strip
  { x: 21, y: 1061, width: 1003, height: 27 },
  // Right side
  { x: 977, y: 25, width: 27, height: 1063 },
  // Additional unreachable areas
  { x: 107, y: 462, width: 799, height: 116 },
  { x: 167, y: 200, width: 605, height: 112 },
  { x: 437, y: 907, width: 139, height: 69 },
  { x: 503, y: 787, width: 73, height: 189 },
  { x: 771, y: 867, width: 135, height: 55 },
  { x: 771, y: 867, width: 67, height: 189 },
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
  private cat?: Phaser.GameObjects.Image
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
  public onShowTaskSelection?: (roomId: string, tasks: TaskData[]) => void

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
    
    // Load cat image
    this.load.image("cat", "/images/cat.png")

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
        DEBUG_COLLISION_AREAS ? 0.3 : 0, // Semi-transparent red if debug mode
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
          },
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
    return UNREACHABLE_AREAS.some((area) => {
      // Scale the area coordinates to match the canvas size
      const scaledX = area.x * SCALE_X
      const scaledY = area.y * SCALE_Y
      const scaledWidth = area.width * SCALE_X
      const scaledHeight = area.height * SCALE_Y

      return x >= scaledX && x <= scaledX + scaledWidth && y >= scaledY && y <= scaledY + scaledHeight
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

    return UNREACHABLE_AREAS.some((area) => {
      // Scale the area coordinates to match the canvas size
      const scaledX = area.x * SCALE_X
      const scaledY = area.y * SCALE_Y
      const scaledWidth = area.width * SCALE_X
      const scaledHeight = area.height * SCALE_Y

      const areaRight = scaledX + scaledWidth
      const areaBottom = scaledY + scaledHeight

      // Check for overlap between cat bounds and area bounds
      return !(catLeft >= areaRight || catRight <= scaledX || catTop >= areaBottom || catBottom <= scaledY)
    })
  }

  createCat() {
    const cat = this.add.image(433, 328, "cat") // Start in lobby (scaled coordinates)
    cat.setScale(0.25) // Scale down to 1/4 of original size
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
        0.3, // Semi-transparent
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
        },
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
          0.3, // More visible in debug mode
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
        const roomIcon = this.add.text(
          -room.width / 2 + 20,
          room.height / 2 - 20,
          icons[room.id as keyof typeof icons],
          {
            fontSize: "20px",
          },
        )
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
        if (this.cat && debugText.active) {
          const catX = Math.round(this.cat.x)
          const catY = Math.round(this.cat.y)
          const inUnreachable = this.isCatInUnreachableArea(catX, catY)

          // Create detailed unreachable areas info
          const areasInfo = UNREACHABLE_AREAS.map((area, index) => {
            const scaledX = Math.round(area.x * SCALE_X)
            const scaledY = Math.round(area.y * SCALE_Y)
            const scaledWidth = Math.round(area.width * SCALE_X)
            const scaledHeight = Math.round(area.height * SCALE_Y)
            return `Area ${index + 1}: (${scaledX}, ${scaledY}) ${scaledWidth}x${scaledHeight}`
          }).join("\n")

          debugText.setText([
            `Cat Position: (${catX}, ${catY})`,
            `In Unreachable Area: ${inUnreachable ? "YES" : "NO"}`,
            `Canvas Size: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`,
            `Scale Factors: X=${SCALE_X.toFixed(3)}, Y=${SCALE_Y.toFixed(3)}`,
            // "",
            // "Unreachable Areas (Scaled):",
            // areasInfo,
          ])
        }
      },
      loop: true,
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
        if (!this.children.list.some((child) => child.name === "collision-warning")) {
          const warning = this.add.text(this.cat.x, this.cat.y - 50, "⚠️ COLLISION", {
            fontSize: "12px",
            color: "#ff0000",
            fontStyle: "bold",
          })
          warning.setOrigin(0.5)
          warning.name = "collision-warning"

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

      // Get available tasks for current room
      const availableTasks = this.tasks.filter((t) => t.location === this.nearRoomId && !t.isCompleted)

      if (availableTasks.length === 1) {
        // Single task - start directly
        if (this.onTaskSelect) {
          this.onTaskSelect(availableTasks[0].id)
        }
      } else if (availableTasks.length > 1) {
        // Multiple tasks - show selection
        if (this.onShowTaskSelection) {
          this.onShowTaskSelection(this.nearRoomId, availableTasks)
        }
      }

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
          this.showRoomEntryMessage(`You've reached ${room.name} - Press SPACE to enter`)
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
      roomName,
      {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        fontStyle: "bold",
      },
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

    // Only notify location change, don't auto-start tasks
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

  public getCatPosition(): { x: number; y: number; room: string } {
    return {
      x: this.cat?.x || 433,
      y: this.cat?.y || 328,
      room: this.currentRoom,
    }
  }

  public setCatPosition(x: number, y: number, room: string) {
    if (this.cat && !this.isPositionUnreachable(x, y)) {
      this.cat.setPosition(x, y)
      this.currentRoom = room
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
