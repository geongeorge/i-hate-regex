A hyphen word break is when a word is broken into 2 using a hyphen (`-`) to be continued in the next line

This is especially useful in scraping data when you wanna join hyphen separated words

The first part of the statement finds lowercase letters (since this should be in the middle of a word) but excludes it from the final selection

the middle part of the statement finds a hyphen and NewLine character that is at the end of a line

the last part looks for a lowercase letter on the new line (again the middle of a sentence so it should be lowercase)
