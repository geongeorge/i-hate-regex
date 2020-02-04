In this case a password may contain:

 - `(?=.*?[A-Z])` : At least one upper case English letter
 - `(?=.*?[a-z])` : At least one lower case English letter
 - `(?=.*?[0-9])` : At least one digit
 - `(?=.*?[#?!@$ %^&*-])` : At least one special character or space
 - `.{8,}` : Minimum eight in length


 The lookahead ( `(?=.*?[A-Z])` ) is used to check if after some characters if there is an occurance of an upper case letter. Similarly all the other lookaheads(lower, numbers, etc) are checked to complete the whole regex.