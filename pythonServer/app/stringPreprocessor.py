def preprocess(string):
    '''
        set all the letter to be lower case, only include alphanumeric characters
        white space at the beginning or the end will be removed, other space will not be removed
    '''
    processed_string = string.strip().lower()
    processed_string = ''.join([c for c in processed_string if c.isalnum() or c.isspace()])
    return processed_string

