lengthLabel1 = 100
middleLabel = 50
marksLabel = 11
kk = 10
gap = 0

for i in range(marksLabel):
    index = i+1
    gap = gap + kk

    if(index == 1):
        gap = 0
        print(index, "green", 0)

    elif(index == marksLabel):
        print(index, "green", lengthLabel1)

    elif(gap == middleLabel):
        print(index, "blue", gap)

    else:
        print(index, "black", gap)
