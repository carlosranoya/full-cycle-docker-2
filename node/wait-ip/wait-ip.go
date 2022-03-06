package main

import (
	"fmt"
	"net"
	"os"
	"strconv"
	"time"
)

func main() {

	args := os.Args

	if len(args) == 1 {
		fmt.Println("Pass ip as argument")
	}

	ip := args[1]

	var tries int = 0

	if len(args) >= 3 {
		tries, _ = strconv.Atoi(args[2])
	}

	ticker := time.NewTicker(1500 * time.Millisecond)
	found := make(chan bool)

	go func(tries int) {
		var i int = 0
		for {

			<-ticker.C
			i++
			if tries > 0 && i > tries {
				ticker.Stop()
				found <- false
				break
			}
			_, err := net.Dial("tcp", ip)
			if err != nil {
				if tries > 0 {
					fmt.Printf("ip %s not reachble %d/%d\n", ip, i, tries)
				} else {
					fmt.Printf("ip %s not reachble\n", ip)
				}
			} else {
				ticker.Stop()
				found <- true
				break
			}

		}
	}(tries)

	ok := <-found
	if ok {
		fmt.Printf("ip %s found\n", ip)
	} else {
		fmt.Printf("ip %s not found\n", ip)
	}
}
