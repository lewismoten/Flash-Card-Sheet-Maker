# Flash Card Sheet Maker
- Designed for puzzle-style practice cards.
- Supports sentence mode or word-group mode.
- Adds light cut marks for use on a paper cutter.
- Repeats a set title on every card to help keep mixed sets together.

# Usage
```bash
node flashcard-maker.mjs config.json input.txt output.pdf
```

# Config options (high level)

| Key | Type | Description |
| --- | --- | --- |
| title                | string   | Title repeated on each card |
| mode                 | string   | "sentences" or "words" |
| wordsPerCard         | number   | Used in word mode |
| removePunctuation    | boolean  | Removes punctuation from card text |
| separatePunctuation  | boolean  | Makes punctuation its own cards/tokens |
| transform            | string   | "none", "upper", "title", or "lower" |
| page.rows            | number   | Cards down the page |
| page.cols            | number   | Cards across the page |
| card.borderColor     | string   | Hex color, e.g. "#4A6FA5" |
| card.borderWidth     | number   | Border thickness in points |
