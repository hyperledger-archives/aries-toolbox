#! /usr/bin/env -S gawk -f

# Get filename and directory of readme in process
BEGIN {
    FILE = ARGV[1]
    "dirname " FILE | getline DIR
}

# Match our start pattern
/Protocol Messages/ {
    p=1 # Set print flag to true
    next # Move on to the next line
}

# Match our end pattern and set print flag to false
/^$/ {p=0}

# For every line for which the print flag is set
p {
    match($2, /\[([[:alpha:]]*)\]\(([#[:alpha:]]*)\)/, matches)
    name = matches[1]
    link = matches[2]
    print "Generating " DIR "/" name "..."
    system("mkdir -p " DIR "/" name)
    printf("See [%s](/docs/%s%s).", name, FILE, link) > DIR "/" name "/README.md"
}
