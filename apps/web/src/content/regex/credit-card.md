This expression can be used to detect or verify credit card numbers:  
- Visa *(group #1)*  
- MasterCard *(group #2)*
- American Express *(group #3)*  
- Diners Club *(group #4)*  
- Discover *(group #5)*  
- JCB *(group #6)* 

**Disclaimer:**  
If you want to use regex just to know the card brand for visual use (display Visa logo or label), that is fine.  
But if your code logic depends on it, then don't use regex, and use a 3rd party plugin/library instead (read more about it [here](https://stackoverflow.com/questions/9315647/regex-credit-card-number-tests/55019607#55019607)).
