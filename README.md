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

## Example Output

Input json:

```
{
  "id": "order",
  "type": "object",
  "properties": {
    "staff_id": {
      "type": "string"
    },
    "consumer": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "avatar": {
          "type": "string"
        }
      }
    },
    "payment_method": {
      "type": "string"
    },
    "total_price": {
      "type": "number"
    },
    "remark": {
      "type": "string"
    },
    "products": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "count": {
            "type": "integer"
          }
        }
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema"
}
```

Output proto:

```
message Order {
    string staff_id = 1;
    message Consumer {
        string id = 1;
        string name = 2;
        string phone = 3;
        string avatar = 4;
    }
    Consumer consumer = 2;
    string payment_method = 3;
    double total_price = 4;
    string remark = 5;
    message Products {
        string id = 1;
        int64 count = 2;
    }
    repeated Products products = 6;
    string created_at = 7;
}
```
