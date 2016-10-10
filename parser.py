#IMPORTS
import os, sys, csv
import codecs
import re
import errno
import exc as exc
from BeautifulSoup import BeautifulSoup
from nltk import sent_tokenize

#path --> Source files Path
#resultpath --> Results file Path
#Make sure that the path files are formatted in the given format:
#Folder --> SubFolder --> HtmlFolder --> SubFolder.Html file 

path = #Enter Path
resultpath = #Enter Results Folder path

#Lists the directories in the given path
#dirs will become a list and we can loop through each folder to get our html file inside them
dirs = os.listdir(path)
#loop each mainfolder
for mainfolder in dirs:
#Making a new path to get the list of directories in the new path
    subpath = path+"\\"+mainfolder
    subdirs = os.listdir(subpath)
#Like above it continues to loop through each folder in a subpath
    for subfolders in subdirs:
#Same as above
        targetpath = subpath+"\\"+subfolders
        maindirs = os.listdir(targetpath)
#By here we will get our desired path to our HTML file
        for file in maindirs:
#It splits by '\\'
            x = targetpath.split('\\')
            folder = x[5]+"\\"+x[6]
            filename = os.path.join(resultpath,folder,file)
#Use print to debug
            #print filename
#writes results in .csv file
#toread contains the exact file path
            towrite = filename+"\\"+file+".csv"
            toread = targetpath+"\\"+file+"\\html"+"\\"+file+".htm"
            #Here we use toread to read the htm file in the given path
#I am using beautifulsoup to read htm files because we can start playing with htm tags which is quite easy to write a parser
            with codecs.open(toread, encoding='utf-8', errors='replace') as f:
                t = f.read().encode('utf-8')
#x variable has potential to access data in specific tags because we have used beautifulsoup
                x = BeautifulSoup(t)
#So, before writing a parser it is necessary to study few documents you want to parse. 
#Then you will get some idea what are the common points in each document and while using those common points you won't loose any data
#Here I am considering a Page as checkpoint. So, it finds out page and get the Text.
                checkpoint = x.getText().find("Page")
#If it is true then it goes inside the if loop
                if checkpoint != -1:
#Here split is done with a term called Page where split actually makes a list but as mentioned it displays the data in the list where
#the index in a list is 1
                    x = x.getText().split("Page",1)[1]
#endpoint is nothing but getting the last index of the text
                    endpoint = len(x)-1
#So, in the startpoint it finds ('----------')
                    startpoint =  x.find('----------')
                else:
#If there is no term called Page in a document which you trying to parse. Then it directly tries to find ('----------') and get the
#end point of the text
                    x = x.getText().encode('utf-8')
                    endpoint = len(x)-1
                    startpoint =  x.find('----------')
#Here we got start and end points of the text --> This is exact text we want from our document
                l =  x[startpoint:endpoint]
#I am using try and except because it won't break while running the program and get's logged without any interruption
                try:
                    l = l.encode('utf-8')
                except(UnicodeDecodeError,UnicodeEncodeError):
                    print"Caught UnicodeDecodeError"
                #MAIN_LOGIC
#replaces new line with space
                l = l.replace("\n"," ")
                
#Creating an empty list with name P[]
                p=[]
                try:
                    global p
                    p = sent_tokenize(l)
                    print p
                except(UnicodeEncodeError,UnicodeDecodeError):
                    print"Caught Unicode error :D :D "
                if not os.path.exists(filename):
                    os.makedirs(filename)

                with open(towrite, 'wb') as f:
                    writer = csv.writer(f)
                    writer.writerow(["FILE TAG ",file])
                    writer.writerow(["\n"])
                    for z in p:
                        try:
                            writer.writerow([file,z.strip()])
                            writer.writerow(["\n"])
                        except(UnicodeEncodeError, UnicodeDecodeError):
                            print "Caught UNICODE ERROR :D