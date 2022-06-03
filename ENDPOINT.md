# __Get contact list domain report__
## __GET__ /lists/:listId/reports/domain
### The endpoint is used to get domain report from contact list with specified listId.<br><br>

## __Request details__
| Required        | How to use | Description  |
| ------------- |:-------------:| -----:|
| API Key      | __hapikey__ in .env file or __hapikey__ property in request body| Used to authenticate the HubSpot request.|
<br>

### __Note: If you use hapikey property in the body of the request, this key will be used in requests to the hubspot, that is, if you need to validate data created at startup, please do not include this field or include it with the same value as the HUBSPOT_API_KEY environment variable in the file .env__

<br>

## __Response details__
### If successful, the returned data will include an array of __DomainReportItem__ or __[ ]__ else returned data include __Error__.<br><br>

### __DomainReportItem__
```json
{
    domain: string,
    quantity: number
}
```


### __Error__
```json
{
    status: string,
    message: string
}
```
<br>

### __Note: This route contains a rate limit based on the hubsport api key (100 requests per 10 seconds)__

<br>

* ### Returns 200 response on sucess.
* ### Returns 400 if listId is invalid.
* ### Returns 502 if there were any errors related to hubspot.
