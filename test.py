# lengthLabel1 = 100
# middleLabel = 50
# marksLabel = 11
# kk = 10
# gap = 0

# for i in range(marksLabel):
#     index = i+1
#     gap = gap + kk

#     if(index == 1):
#         gap = 0
#         print(index, "green", 0)

#     elif(index == marksLabel):
#         print(index, "green", lengthLabel1)

#     elif(gap == middleLabel):
#         print(index, "blue", gap)

#     else:
#         print(index, "black", gap)

############################################

# # tn = a + (n-1)d

# n = 19

# if (n%2 == 0):
#     num1 = n//2
#     num2 = (n+2)//2
#     num3 = n+1
# else:
#     num1 = n//2
#     num2 = (n+1)//2
#     num3 = n+1

# # print(num1, num2)

# for n in range(num1, 0, -1):
#     print(n)
# for i in range(num2, num3, 1):
#     print(i)

############################################

marksLabel = 7
lengthLabel1 = 60
kk = 10

Green2Black = 1
Black2Blue = 2

list1 = []
def middle_out(a):
    while a:
        yield a.pop(len(a) // 2)
        
indexlist = list(range(1, marksLabel+1))
marks = ([*middle_out(indexlist)])

for count, value in enumerate(marks):
    if(count == 0):
        list1.append([value, "blue"])
    elif(count == len(marks)-1):
        list1.append([value, "green"])
    elif(count == len(marks)-2):
        list1.append([value, "green"])
    else:
        list1.append([value, "black"])

def f(start, end, gap, bins):
    arr = [None] * bins
    mid_index = len(arr)//2
    arr[0] = start
    arr[bins-1] = end
    arr[mid_index] = end//2

    for index, val in enumerate(arr):
        if (index < mid_index and val == None):
            for mul, i in enumerate(range(index, 0, -1)):
                if end//2 - (gap * (mul+1)) > 0:
                    arr[i] = end//2 - (gap * (mul+1))
                else:
                    arr[i] = 0

        elif (index > mid_index and val == None):
            for mul, i in enumerate(range(index, len(arr)-1, 1)):
                if end//2 + (gap * (mul+1)) < end:
                    arr[i] = end//2 + (gap * (mul+1))
                else:
                    arr[i] = end
    return arr

list2 = [*middle_out(f(start=0, end=lengthLabel1, gap=kk, bins=marksLabel))]
ziplist = list(zip(list1, list2))

list3 = sorted(ziplist, key=lambda x: x[0])
offsets = [([0, 'None'], 0)] + list3[:-1], list3

for ele in list(zip(*offsets)):
    if(ele[0][0][1] == 'None' and ele[1][0][1] == 'green'):
        print(ele[0][0][1], ele[1][0][1], ele[1][0][0], ele[1][0][1], ele[1][1])
    elif(ele[0][0][1] == 'green' and ele[1][0][1] == 'black'):
        print(ele[0][0][1], ele[1][0][1], ele[1][0][0], ele[1][0][1], ele[1][1]+Green2Black)
    elif(ele[0][0][1] == 'green' and ele[1][0][1] == 'blue'):
        print(ele[0][0][1], ele[1][0][1], ele[1][0][0], ele[1][0][1], ele[1][1]+(Green2Black+Black2Blue))
    elif(ele[0][0][1] == 'black' and ele[1][0][1] == 'black'):#
        print(ele[0][0][1], ele[1][0][1], ele[1][0][0], ele[1][0][1], ele[1][1])
    elif(ele[0][0][1] == 'black' and ele[1][0][1] == 'blue'):#
        print(ele[0][0][1], ele[1][0][1], ele[1][0][0], ele[1][0][1], ele[1][1]+Black2Blue)
    elif(ele[0][0][1] == 'black' and ele[1][0][1] == 'green'):#
        print(ele[0][0][1], ele[1][0][1], ele[1][0][0], ele[1][0][1], ele[1][1]-Green2Black)
    elif(ele[0][0][1] == 'blue' and ele[1][0][1] == 'black'):#
        print(ele[0][0][1], ele[1][0][1], ele[1][0][0], ele[1][0][1], ele[1][1]-Black2Blue)
    elif(ele[0][0][1] == 'blue' and ele[1][0][1] == 'green'):
        print(ele[0][0][1], ele[1][0][1], ele[1][0][0], ele[1][0][1], ele[1][1]-(Green2Black+Black2Blue))
    else:
        print(ele[0][0][1], ele[1][0][1], ele[1][0][0], ele[1][0][1], ele[1][1])