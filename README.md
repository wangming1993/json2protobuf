# Json to proto buffer message

Specific one directory, it will read all json file under directory.
It supports **ref** of json property. 


```
Usage: 
  node index.js -d directory

Example: 
  node index.js -d  /home/user/schemas

Options:
  --help         Show usage information                                         
  --version, -v  Show version                                                   
  --dir, -d      The directory of json files                                    
  --split, -s    Indicate generate one proto file or more      
```

To delete old proto files, you can run `make clean`
