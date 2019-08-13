export default {
    methods: {
        insertTextAtCursor(text) {
            var sel, range, html;
            if (window.getSelection) {
              sel = window.getSelection();
              if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(text));
              }
            } else if (document.selection && document.selection.createRange) {
              document.selection.createRange().text = text;
            }
          },
          onPaste(e){
            let plaintext = e.clipboardData.getData('text/plain')
            this.insertTextAtCursor(plaintext);
          }
    }
}