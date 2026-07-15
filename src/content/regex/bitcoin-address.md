The unique identifier which serves as the virtual location of cryptocurrency. The Bitcoin address is an identifier of **26-35** alphanumeric characters, beginning with the number `1`, `3` or `bc1`.

`0, O, I, l` are removed to avoid visual ambiguity. 

There are currently three address formats in use:

1.**P2PKH** which begin with the number `1` 

        1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2

2.**P2SH** type starting with the number `3`  

        3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy

3.**Bech32** type starting with `bc1`

        bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq



The length of the bitcoin address is validated. After which, it is checked for digits, lowercase or uppercase characters. The prefix is also checked later. It must also be made sure to pass the text which contains only the bitcoin address (`^` and `$` makes sure of this).