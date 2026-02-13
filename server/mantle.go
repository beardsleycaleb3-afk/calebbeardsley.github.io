package main

import (
	"encoding/json"
	"log"
	"math"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket" // Best available WS library
)

// O0Config defines the Triad's constants
const (
	MaxEntropy = 1.618 // Phi limit
	BaseRPM    = 33.33
	TickRate   = 60 * time.Millisecond // ~16 updates/sec
)

// TriadState represents the synchronized "Truth" of the system
type TriadState struct {
	RPM       float64 `json:"rpm"`
	Entropy   float64 `json:"entropy"`
	Cycle     int64   `json:"cycle"`
	Phase     string  `json:"phase"` // "Bach", "Chaos", "Void"
	Timestamp int64   `json:"ts"`
}

// Hub maintains the set of active clients (The "Crust" nodes)
type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan TriadState
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mutex      sync.Mutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // Allow PWA connections
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan TriadState),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
			log.Println("O0+ NODE CONNECTED")
		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
			}
			h.mutex.Unlock()
			log.Println("O0+ NODE LOST")
		case state := <-h.broadcast:
			h.mutex.Lock()
			data, _ := json.Marshal(state)
			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, data)
				if err != nil {
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mutex.Unlock()
		}
	}
}

// Spin generates the "G81 Collapse" logic in real-time
func spin(hub *Hub) {
	ticker := time.NewTicker(TickRate)
	defer ticker.Stop()

	var cycle int64 = 0
	
	for range ticker.C {
		cycle++
		t := float64(cycle) * 0.06

		// Mathematical model of the "oO0" curve
		currentRPM := BaseRPM + (math.Sin(t)*20 + math.Cos(t*0.5)*10)
		entropy := math.Abs(math.Sin(t * 0.1)) * MaxEntropy

		phase := "Stable"
		if entropy > 1.2 {
			phase = "Chaos"
		} else if entropy < 0.2 {
			phase = "Void"
		}

		// Broadcast the Truth
		hub.broadcast <- TriadState{
			RPM:       currentRPM,
			Entropy:   entropy,
			Cycle:     cycle,
			Phase:     phase,
			Timestamp: time.Now().UnixNano(),
		}
	}
}

func main() {
	hub := newHub()
	go hub.run()  // Start the Connection Handler
	go spin(hub)  // Start the Core Rotation

	http.HandleFunc("/mantle", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Upgrade Error:", err)
			return
		}
		hub.register <- conn
	})

	log.Println(">> MANTLE ACTIVE ON :8080 <<")
	log.Println(">> AWAITING TRIAD SYNCHRONIZATION <<")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
