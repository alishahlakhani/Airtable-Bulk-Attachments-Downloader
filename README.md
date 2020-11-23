# Airtable-Bulk-Attachments-Downloader
Use this script to bulk download all Airtable attachments no matter how big they are.

## How to Configure?
1. This project uses Typescript so ensure your row schema is properly updated for it to function.
```ts
// Step 1: Change your Row type
type RowType = {
    'Name': string,
    Class: string,
    Attachments: string,
    'Remarks (if any)': string
}
```
Change it to whatever your row schema is and it'll work.
2. Make sure you have `urls.csv` in the same dir as the code.
3. Update the following constants as needed:
- `folderDist`: This refers to the categories by which you want to store in folders. If you want to create multiple folders when downloading and you want to classify it by any particular row header than you can do so here. 
- `downloadsFolder`: Folder name where you wish to download all files to. Default is 'downloaded'
- `attachmentsColumnNumber`: Column name for attachments.

## How to run?
1. Run `npm install`
2. Run `npm start` and voila!

## FAQ: 
### Don't know how to get your Row schema?
Row schema refers to the headers you see in your table. For example If I'm collecting `Name | Class | Attachments` on airtable than the row schema would be 
```ts
type RowType = {
    Name: string,
    Class: string,
    Attachments: string,
}
```
### What to do if something isn't working as I want?
Just raise an issue and I'll work on it or feel free to raise a PR
