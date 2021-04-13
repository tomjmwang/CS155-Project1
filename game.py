import random

class ExplodingLiar:

    def __init__(self):
        self.players = [0,1,2,3]
        self.liar = -1
        self.deck1 = []
        self.deck2 = []
        self.truth = 40
        self.lie = 20
        self.end_game_threshold = 15
        self.current_player = 0

    def resetGame(self):
        self.deck1 = []
        self.deck2 = []
        for i in range(self.truth):
            self.deck1.append(True)
        for i in range(self.lie):
            self.deck1.append(False)
        random.shuffle(self.deck1)
        self.current_player = 0
        self.liar = random.choice(self.players)

    def simulateGame(self):
        while len(self.deck2) < self.end_game_threshold:
            card = self.deck1.pop(0)
            if card == True:
                if self.liar == self.current_player:
                    self.deck2.append(card)
                else:
                    self.deck1.append(card)
            else:
                if self.liar == self.current_player:
                    self.deck1.append(card)
                else:
                    self.deck2.append(card)
            self.current_player += 1
            if self.current_player > 3:
                self.current_player = 0
        return self.deck1, self.deck2

if __name__ == "__main__":
    game = ExplodingLiar()
    deck1_true_count = 0
    deck1_false_count = 0
    deck2_true_count = 0
    deck2_false_count = 0
    for i in range(10000):
        game.resetGame()
        deck1, deck2 = game.simulateGame()
        #print("game", i)
        #print(deck1)
        #print(deck2)
        #print(deck1.count(True), deck1.count(False))
        #print(deck2.count(True), deck2.count(False))
        deck1_true_count += deck1.count(True)
        deck1_false_count += deck1.count(False)
        deck2_true_count += deck2.count(True)
        deck2_false_count += deck2.count(False)
    print("deck 1 true count:", deck1_true_count/10000)
    print("deck 1 false count:", deck1_false_count/10000)
    print("deck 2 true count:", deck2_true_count/10000)
    print("deck 2 false count:", deck2_false_count/10000)