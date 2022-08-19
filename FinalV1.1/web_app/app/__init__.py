from asyncio.windows_events import NULL
# from cmath import log
# import MySQLdb
from flask import Flask, render_template, request, url_for, redirect, flash, session
import os
import sys
# from app.home import home as home_blueprint
from flask_mysqldb import MySQL
# from traitlets import Undefined
# from functools import wraps
mysql = NULL
exeFileNo = NULL
exetxt1 = NULL
exetxt2 = NULL
exetxt3 = NULL
exetxt4 = NULL
# sub13 = NULL

# def is_logged_in(f):
#     @wraps(f)
#     def wrap(*args, **kwargs):
#         if 'logged_in' in session:
#             return f(*args, **kwargs)
#         else:
#             flash("error, Error, Unauthorized!, Machine in Automode")
#             return redirect(url_for('execute'))
#     return wrap

# session['logged_in'] = False

def init_extensions(app: Flask):
    # use .init_app() on your extensions to register them on
    # the Flask instance
    pass
    
def init_mysql(app: Flask):

    f = open("c:\\config\\config.txt", "r")
    config = f.read().split(",")
    
    app.config['MYSQL_HOST'] = config[1]
    app.config['MYSQL_USER'] = config[2]
    app.config['MYSQL_PASSWORD'] = config[3]
    app.config['MYSQL_DB'] = config[4]
    mysql = MySQL(app)
    return mysql

def get_root_dir_abs_path() -> str:
    """
    Get the absolute path to the root directory of the application.
    """
    # Check if the application runs in a bundled executable from PyInstaller.
    # When executed, the bundled executable get's unpacked into the temporary directory sys._MEIPASS.
    # See also: https://pyinstaller.readthedocs.io/en/stable/runtime-information.html#using-file
    return getattr(sys, "_MEIPASS", os.path.abspath(os.path.dirname(__file__)))


def create_app(config_object_name) -> Flask:
    """
    :param config_object_name: The python path of the config object.
                               E.g. appname.settings.ProdConfig
    """

    root_dir_abs_path = get_root_dir_abs_path()

    # Initialize the core application
    app = Flask(
        __name__,
        instance_relative_config=False,
        static_folder=os.path.join(root_dir_abs_path, "static"),
        template_folder=os.path.join(root_dir_abs_path, "templates"),
    )


    app.config.from_object(config_object_name)

    # Initialize Plugins at startup using init_app()
    init_extensions(app)
    # mysql = init_mysql(app)

    with app.app_context():
        # Register Blueprints
        # app.register_blueprint(home_blueprint, url_prefix="/")
        mysql = init_mysql(app)

        @app.route("/login")
        def login():
            session['logged_in'] = False
            try:
                cursor = mysql.connection.cursor()
                cursor.execute(''' SET SQL_SAFE_UPDATES = 0 ''')
                cursor.execute(''' delete from Files where saved = 0 AND Item_Des = "0" ''')
                mysql.connection.commit()
                cursor.close()

                cursor = mysql.connection.cursor()
                cursor.execute(''' SELECT * FROM Users ''')
                users = cursor.fetchall()
                cursor.close()
                return render_template("page/home/login.html", title="Login", data=users)

            except:
                return render_template("page/errors/404.html", title="Error"), 400


        @app.route("/")
        def homepage():
            cursor = mysql.connection.cursor()
            cursor.execute(''' SELECT * FROM Files ''')
            sub11 = cursor.fetchall()
            cursor.close()

            cursor = mysql.connection.cursor()
            cursor.execute(''' SELECT * FROM exeFiles ''')
            sub12 = cursor.fetchall()
            cursor.close()

            cursor = mysql.connection.cursor()
            cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
            sub13 = cursor.fetchall()
            cursor.close()

            return render_template("page/home/index.html", title="Welcome", sub11=sub11, sub12=sub12, sub13=sub13, win="sub11")


        @app.route("/chngpswd", methods=["POST", "GET"])
        def chngpswd():
            if request.method == "POST":
                userName = request.form["InputUserName"]
                userPassword = request.form["InputUserPassword"]
                newPassword = request.form["InputNewPassword"]

                cursor = mysql.connection.cursor()
                result = cursor.execute("SELECT User_Password FROM Users WHERE User_Name = %s", (userName,))
                curpwd = cursor.fetchall()
                cursor.close()

                if(result == 1 and userPassword == curpwd[0][0]):
                    cursor = mysql.connection.cursor()
                    sql = "UPDATE Users SET User_Password = %s WHERE User_Name = %s"
                    val = (newPassword, userName)
                    cursor.execute(sql, val)
                    mysql.connection.commit()
                    cursor.close()

                    return render_template("page/home/index.html", title="Welcome", win="logout")
                else:
                    flash("error, Error, Password Changed Error!, Please enter valid username or password")
                    return redirect(url_for('homepage'))


        @app.route("/fileSave", methods=["POST", "GET"])
        def fileSave():
            if request.method == "POST":
                if request.form['btn'] == 'Save':
                    FileNo = request.form["FileNo"]
                    ItemDescripition = request.form["ItemDescripition"]
                    DrawingNo = request.form["DrawingNo"]
                    DrawingIssue = request.form["DrawingIssue"]

                    # cursor = mysql.connection.cursor()
                    # res = cursor.execute(''' SELECT File_No FROM Files where File_No = %s ''',(FileNo,))
                    # cursor.close()

                    try:
                        cursor = mysql.connection.cursor()
                        # sql = """INSERT INTO Files (File_No, Item_Des, Dra_No, Dra_Iss, Jig_Sts) 
                        #          SELECT * FROM (SELECT %s, %s, %s, %s, %s) as temp
                        #          WHERE NOT EXISTS (Select File_No from Files where File_No= %s)
                        #       """

                        sql = "INSERT INTO Files (File_No, Item_Des, Dra_No, Dra_Iss, Jig_Sts) VALUES (%s, %s, %s, %s, %s)"
                        val = (FileNo, ItemDescripition, DrawingNo, DrawingIssue, "Work")
                        cursor.execute(sql, val)
                        mysql.connection.commit()
                        cursor.close()
                        flash("info, Succes, Successfully Updated!, Data successfully inserted")
                        return redirect(url_for('homepage'))
                    except:
                        flash("error, Error, Found Duplicate Entry!, Plase enter valid file No")
                        return redirect(url_for('homepage'))

                elif request.form['btn'] == 'Update':
                    FileNo = request.form["FileNo"]
                    ItemDescripition = request.form["ItemDescripition"]
                    DrawingNo = request.form["DrawingNo"]
                    DrawingIssue = request.form["DrawingIssue"]

                    cursor = mysql.connection.cursor()
                    sql = "UPDATE Files SET Item_Des = %s, Dra_No = %s, Dra_Iss = %s WHERE File_No = %s"
                    val = (ItemDescripition, DrawingNo, DrawingIssue, FileNo)
                    cursor.execute(sql, val)
                    mysql.connection.commit()
                    cursor.close()
                    flash("info, Succes, Successfully Updated!, Data successfully updated")
                    return redirect(url_for('homepage'))

                elif request.form['btn'] == 'Delete':
                    FileNo = request.form["FileNo"]

                    cursor = mysql.connection.cursor()
                    cursor.execute("DELETE FROM Files WHERE File_No = %s", [FileNo])
                    cursor.execute("DELETE FROM exeFiles WHERE File_No = %s", [FileNo])
                    mysql.connection.commit()
                    cursor.execute("DROP TABLE IF EXISTS`%s`" % (FileNo))
                    cursor.close()

                    flash("warning, Warning, Successfully Deleted!, Data successfully deleted")
                    return redirect(url_for('homepage'))


        @app.route("/process", methods=['GET', 'POST'])
        def process():
            if request.method == 'POST':
                if request.form['btn'] == 'Done':
                    lengthLabel1 = int(request.form["lengthLabel1"])
                    middleLabel = int(request.form["middleLabel"])
                    marksLabel = int(request.form["marksLabel"])
                    turnLabel = int(request.form["turnLabel"])
                    adjustemtLabel = int(request.form["adjustemtLabel"])
                    kk = int(request.form["kkLabel"])

                    fileLabel1 = request.form["fileLabel1"]
                    drawingLabel1 = request.form["drawingLabel1"]
                    issueLabel1 = request.form["issueLabel1"]
                    gap = 0

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT saved FROM Files where File_No = %s ''',(fileLabel1,))
                    res = cursor.fetchone()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                    sub13 = cursor.fetchall()
                    cursor.close()

                    # print(res[0])

                    if(res[0] == 0):
                        cursor = mysql.connection.cursor()
                        cursor.execute(''' SET SQL_SAFE_UPDATES = 0 ''')
                        # cursor.execute(''' delete from Files where File_No = %s AND saved = 0 AND Item_Des is null ''',(fileLabel1,))
                        # cursor.execute(''' delete from Files where saved = 0 AND Item_Des = "0" ''')
                        cursor.execute(''' delete from tmpjig ''')
                        mysql.connection.commit()
                        cursor.close()

                        cursor = mysql.connection.cursor()
                        # for i in range(marksLabel):
                        #     index = i+1
                        #     gap = gap + kk

                        #     if(index == 1):
                        #         sql = "INSERT INTO tmpjig (ind, clr, gap) VALUES ( %s, %s, %s)"
                        #         val = (index, "green", 0)
                        #         cursor.execute(sql, val)
                        #         mysql.connection.commit()

                        #     elif(index == marksLabel):
                        #         sql = "INSERT INTO tmpjig (ind, clr, gap) VALUES ( %s, %s, %s)"
                        #         val = (index, "green", lengthLabel1)
                        #         cursor.execute(sql, val)
                        #         mysql.connection.commit()

                        #     elif(gap == middleLabel):
                        #         sql = "INSERT INTO tmpjig (ind, clr, gap) VALUES ( %s, %s, %s)"
                        #         val = (index, "blue", gap)
                        #         cursor.execute(sql, val)
                        #         mysql.connection.commit()

                        #     else:
                        #         sql = "INSERT INTO tmpjig (ind, clr, gap) VALUES ( %s, %s, %s)"
                        #         val = (index, "black", gap)
                        #         cursor.execute(sql, val)
                        #         mysql.connection.commit()

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

                        for ele in sorted(ziplist, key=lambda x: x[0]):
                            print(ele[0][0], ele[0][1], ele[1])
                            sql = "INSERT INTO tmpjig (ind, clr, gap) VALUES ( %s, %s, %s)"
                            val = (ele[0][0], ele[0][1], ele[1])
                            cursor.execute(sql, val)
                            mysql.connection.commit()
                            
                        cursor.close()

                        cursor = mysql.connection.cursor()
                        # cursor.execute(''' SELECT * FROM Files where File_No = %s and Item_Des = "0" and saved = 0 ''',(fileLabel1,))
                        cursor.execute(''' SELECT * FROM tmpjig ''')
                        tempjig = cursor.fetchall()
                        cursor.close()

                    else:
                        cursor = mysql.connection.cursor()
                        cursor.execute("DROP TABLE IF EXISTS tmpjig")
                        cursor.execute(""" CREATE TABLE tmpjig (SELECT * FROM `%s`)""" % (fileLabel1))
                        cursor.close()

                        # cursor.execute("INSERT INTO tmpjig (SELECT * FROM `%s`)" % fileLabel1)
                        cursor = mysql.connection.cursor()
                        cursor.execute(''' SELECT * FROM tmpjig ''')
                        tempjig = cursor.fetchall()
                        cursor.close()

                        cursor = mysql.connection.cursor()
                        cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                        sub13 = cursor.fetchall()
                        cursor.close()

                        return render_template("page/home/index.html", title="Welcome", jig=tempjig, win="sub12", sub11=sub11, sub12=sub12, sub13=sub13,
                        L=lengthLabel1, M=middleLabel, N=marksLabel, C=turnLabel, A=adjustemtLabel, KK=kk,
                        F=fileLabel1, D=drawingLabel1, I=issueLabel1)
                                
                    return render_template("page/home/index.html", title="Welcome", jig=tempjig, win="sub12", sub11=sub11, sub12=sub12, sub13=sub13,
                    L=lengthLabel1, M=middleLabel, N=marksLabel, C=turnLabel, A=adjustemtLabel, KK=kk,
                    F=fileLabel1, D=drawingLabel1, I=issueLabel1)

                if request.form['btn'] == 'Add':
                    try:
                        placeLabel = int(request.form["placeLabelx"])
                        colorLabel = request.form["colorLabel"]
                        gapLabel = int(request.form["gapLabel"])

                        cursor = mysql.connection.cursor()
                        sql = ''' UPDATE tmpjig SET clr = %s, gap = %s WHERE ind = %s '''
                        val = (colorLabel, gapLabel, placeLabel)
                        cursor.execute(sql, val)
                        mysql.connection.commit()
                        cursor.close()

                    except:
                        flash("error, Error, Unsuccessfully Added!, Data unsuccessfully added")

                    lengthLabel1 = int(request.form["lengthLabel1"])
                    middleLabel = int(request.form["middleLabel"])
                    marksLabel = int(request.form["marksLabel"])
                    turnLabel = int(request.form["turnLabel"])
                    adjustemtLabel = int(request.form["adjustemtLabel"])
                    kk = int(request.form["kkLabel"])

                    fileLabel1 = request.form["fileLabel1"]
                    drawingLabel1 = request.form["drawingLabel1"]
                    issueLabel1 = request.form["issueLabel1"]

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    # cursor.execute(''' SELECT * FROM Files where File_No = %s AND Item_Des = "0" ''',(fileLabel1,))
                    cursor.execute(''' SELECT * FROM tmpjig ''')
                    modjig = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                    sub13 = cursor.fetchall()
                    cursor.close()

                    return render_template("page/home/index.html", title="Welcome", jig=modjig, win="sub12", sub11=sub11, sub12=sub12, sub13=sub13,
                    L=lengthLabel1, M=middleLabel, N=marksLabel, C=turnLabel, A=adjustemtLabel, KK=kk,
                    F=fileLabel1, D=drawingLabel1, I=issueLabel1)

                if request.form['btn'] == 'Clear':
                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SET SQL_SAFE_UPDATES = 0 ''')
                    cursor.execute(''' delete from tmpjig ''')
                    mysql.connection.commit()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                    sub13 = cursor.fetchall()
                    cursor.close()

                    return render_template("page/home/index.html", title="Welcome", win="sub12", sub11=sub11, sub12=sub12, sub13=sub13)

                if request.form['btn'] == 'Preview':
                    lengthLabel1 = int(request.form["lengthLabel1"])
                    middleLabel = int(request.form["middleLabel"])
                    marksLabel = int(request.form["marksLabel"])
                    turnLabel = int(request.form["turnLabel"])
                    adjustemtLabel = int(request.form["adjustemtLabel"])
                    kk = int(request.form["kkLabel"])

                    fileLabel1 = request.form["fileLabel1"]
                    drawingLabel1 = request.form["drawingLabel1"]
                    issueLabel1 = request.form["issueLabel1"]

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    # cursor.execute(''' SELECT * FROM Files WHERE File_No = %s AND Item_Des = "0" ''', (fileLabel1,))
                    cursor.execute(''' SELECT * FROM tmpjig ''')
                    prvdata = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                    sub13 = cursor.fetchall()
                    cursor.close()

                    return render_template("page/home/index.html", title="Welcome", win="prv", jig=prvdata, sub11=sub11, sub12=sub12, sub13=sub13,
                    L=lengthLabel1, M=middleLabel, N=marksLabel, C=turnLabel, A=adjustemtLabel, KK=kk,
                    F=fileLabel1, D=drawingLabel1, I=issueLabel1)
                
                if request.form['btn'] == 'Save':
                    lengthLabel1 = int(request.form["lengthLabel1"])
                    middleLabel = int(request.form["middleLabel"])
                    marksLabel = int(request.form["marksLabel"])
                    turnLabel = int(request.form["turnLabel"])
                    adjustemtLabel = int(request.form["adjustemtLabel"])
                    kk = int(request.form["kkLabel"])

                    fileLabel1 = request.form["fileLabel1"]
                    drawingLabel1 = request.form["drawingLabel1"]
                    issueLabel1 = request.form["issueLabel1"]

                    # cursor = mysql.connection.cursor()
                    # cursor.execute(''' SELECT saved FROM Files where File_No = %s and Item_Des != "0" and Jig_Sts = "Work" ''',(fileLabel1,))
                    # res = cursor.fetchone()
                    # cursor.close()

                    # print(res[0])

                    # if(res[0] == 0):

                    #     try:
                    #         cursor = mysql.connection.cursor()
                    #         cursor.execute(''' UPDATE Files SET saved = 1 WHERE File_No = %s AND Item_Des = "0" ''', (fileLabel1,))

                    #         sql = ''' UPDATE Files SET saved = 1, len = %s, md = %s, mark = %s, turn = %s, adj = %s, kk = %s WHERE File_No = %s AND Item_Des != "0" '''
                    #         val = (lengthLabel1, middleLabel, marksLabel, turnLabel, adjustemtLabel, kk, fileLabel1)
                    #         cursor.execute(sql, val)
                    #         mysql.connection.commit()
                    #         cursor.close()
                    #         flash("info, Succes, Successfully Saved!, Data successfully saved")
                    #     except:
                    #         flash("error, Error, Unsuccessfully Saved!, Data unsuccessfully saved")
                    
                    # else:
                    #     flash("info, Succes, Successfully Overwrite!, Data successfully Overwrite")

                    try:
                        # cursor = mysql.connection.cursor()
                        # sql = """CREATE TABLE `%s` (ind INT NOT NULL, clr VARCHAR(255) NOT NULL, gap INT NOT NULL)""" % (fileLabel1)
                        # cursor.execute(sql)
                        # cursor.close()

                        cursor = mysql.connection.cursor()
                        cursor.execute(""" CREATE TABLE `%s` (SELECT * FROM tmpjig)""" % (fileLabel1))

                        sql = ''' UPDATE Files SET saved = 1, len = %s, md = %s, mark = %s, turn = %s, adj = %s, kk = %s WHERE File_No = %s '''
                        val = (lengthLabel1, middleLabel, marksLabel, turnLabel, adjustemtLabel, kk, fileLabel1)
                        cursor.execute(sql, val)
                        mysql.connection.commit()
                        cursor.close()

                        flash("info, Succes, Successfully Saved!, Data successfully saved")
                    except:

                        cursor = mysql.connection.cursor()
                        cursor.execute("DROP TABLE IF EXISTS `%s`" %(fileLabel1))
                        cursor.execute(""" CREATE TABLE `%s` (SELECT * FROM tmpjig)""" % (fileLabel1))
                        cursor.close()

                        # cursor = mysql.connection.cursor()
                        # cursor.execute("INSERT INTO `%s` SELECT * FROM tmpjig" % (fileLabel1))
                        # mysql.connection.commit()
                        # cursor.close()
                        flash("info, Succes, Table exist!, Data overwrited")

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    # cursor.execute(''' SELECT * FROM Files where File_No = %s AND Item_Des = "0" AND saved = 1 ''',(fileLabel1,))
                    # cursor.execute("SELECT * FROM %s ",[fileLabel1])
                    cursor.execute("SELECT * FROM `%s`" % (fileLabel1))
                    savjig = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                    sub13 = cursor.fetchall()
                    cursor.close()

                    return render_template("page/home/index.html", title="Welcome", jig=savjig, win="sub12", sub11=sub11, sub12=sub12, sub13=sub13,
                    L=lengthLabel1, M=middleLabel, N=marksLabel, C=turnLabel, A=adjustemtLabel, KK=kk,
                    F=fileLabel1, D=drawingLabel1, I=issueLabel1)

            return redirect(url_for('homepage'))
            # return render_template("page/home/index.html", title="Welcome", sub12=sub12, win="sub12")

        @app.route("/execute", methods=['GET', 'POST'])
        def execute():
            global exeFileNo
            if request.method == 'POST':
                if request.form['btnexe'] == 'Start':

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    try:
                        cursor = mysql.connection.cursor()
                        cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                        sub13 = cursor.fetchall()
                        cursor.close()

                        cursor = mysql.connection.cursor()
                        cursor.execute("SELECT * FROM %s" % exeFileNo)
                        exe = cursor.fetchall()
                        cursor.close()

                        exeFileNo = NULL        
                        return render_template("page/home/index.html", title="Welcome", win="exe", exe=exe, sub11=sub11, sub12=sub12, sub13=sub13)

                    except:
                        flash("error, Error, Select the file!, Select the file to start the execution")
                        return render_template("page/home/index.html", title="Welcome", win="sub22", sub11=sub11, sub12=sub12, sub13=sub13)

                    # return render_template("page/home/index.html", title="Welcome", win="exe", exe=exe, sub11=sub11, sub12=sub12, sub13=sub13)
                    # exetxt1=exetxt1, exetxt2=exetxt2, exetxt3=exetxt3, exetxt4=exetxt4)
                    # request.form['btnexe']

                if request.form['btnexe'] == 'Pre Print':

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    try:
                        cursor = mysql.connection.cursor()
                        cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                        sub13 = cursor.fetchall()
                        cursor.close()

                        cursor = mysql.connection.cursor()
                        cursor.execute("SELECT * FROM %s" % exeFileNo)
                        exe = cursor.fetchall()
                        cursor.close()

                        exeFileNo = NULL        
                        return render_template("page/home/index.html", title="Welcome", win="prePrint", exe=exe, sub11=sub11, sub12=sub12, sub13=sub13)

                    except:
                        flash("error, Error, Select the file!, Select the file to start the execution")
                        return render_template("page/home/index.html", title="Welcome", win="sub22", sub11=sub11, sub12=sub12, sub13=sub13)
                
                if request.form['btnexe'] != 'Start' and request.form['btnexe'] != 'Pause' and request.form['btnexe'] != 'Stop' and request.form['btnexe'] != 'Pre Print':

                    exeFileNo = request.form['btnexe']

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM %s ''' % request.form['btnexe'])
                    exe = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(request.form['btnexe'],))
                    sub13 = cursor.fetchall()
                    cursor.close()

                    return render_template("page/home/index.html", title="Welcome", win="preexe", exe=exe, sub11=sub11, sub12=sub12, sub13=sub13)

            return redirect(url_for('homepage'))


        # @app.route("/move_forward", methods=['GET', 'POST'])
        # def move_forward():
        #     global exeFileNo
        #     if request.method == 'GET':
        #         fileNo = request.args.get('title')
        #         exetxt1 = request.args.get('exetxt1')
        #         exetxt2 = request.args.get('exetxt2')
        #         exetxt3 = request.args.get('exetxt3')
        #         exetxt4 = request.args.get('exetxt4')

        #         exeFileNo = fileNo

        #         cursor = mysql.connection.cursor()
        #         cursor.execute(''' SELECT * FROM `%s` ''' % fileNo)
        #         exetbl = cursor.fetchall()
        #         cursor.close()

        #         cursor = mysql.connection.cursor()
        #         cursor.execute(''' SELECT * FROM Files ''')
        #         sub11 = cursor.fetchall()
        #         cursor.close()

        #         return render_template("page/home/index.html", title="Welcome", win="sub23", sub11=sub11, exetbl=exetbl,
        #         exetxt1=exetxt1, exetxt2=exetxt2, exetxt3=exetxt3, exetxt4=exetxt4)

        #     # if request.method == 'POST':
        #     #     return redirect(url_for('homepage'))
        #     return redirect(url_for('homepage'))


        @app.route("/addexetbl", methods=['GET', 'POST'])
        def addexetbl():
            if request.method == 'POST':
                if request.form['btnadd'] == 'Add':

                    fileLabel1 = request.form["slcdesfile"]

                    cursor = mysql.connection.cursor()
                    # sql = "INSERT INTO exeFiles (File_No, Item_Des, Dra_No, Dra_Iss, Jig_Sts) VALUES (%s, %s, %s, %s, %s)"
                    # val = (FileNo, ItemDescripition, DrawingNo, DrawingIssue, "Work")
                    # cursor.execute(sql, val)
                    # mysql.connection.commit()
                    # cursor.close()

                    try:
                        cursor.execute('''INSERT INTO exeFiles SELECT * FROM Files WHERE File_No=%s''',(fileLabel1,))
                        mysql.connection.commit()
                        cursor.close()
                        flash("info, Succes, Successfull!, Data successfully inserted")
                    except:
                        flash("error, Error, Found Duplicate Entry!, Plase check")

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                    sub13 = cursor.fetchall()
                    cursor.close()

                    return render_template("page/home/index.html", title="Welcome", win="sub21", sub11=sub11, sub12=sub12, sub13=sub13)

                if request.form['btnadd'] == 'Remove':
                    fileLabel1 = request.form["slcdesfile"]

                    cursor = mysql.connection.cursor()
                    cursor.execute('''delete from exeFiles WHERE File_No=%s''',(fileLabel1,))
                    mysql.connection.commit()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                    sub13 = cursor.fetchall()
                    cursor.close()

                    return render_template("page/home/index.html", title="Welcome", win="sub21", sub11=sub11, sub12=sub12, sub13=sub13)

                if request.form['btnadd'] == 'Save':
                    return redirect(url_for('homepage'))
                
                if request.form['btnadd'] == 'Clear':
                    cursor = mysql.connection.cursor()
                    cursor.execute('''delete from exeFiles ''')
                    mysql.connection.commit()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM Files ''')
                    sub11 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles ''')
                    sub12 = cursor.fetchall()
                    cursor.close()

                    cursor = mysql.connection.cursor()
                    cursor.execute(''' SELECT * FROM exeFiles WHERE File_No= %s''',(exeFileNo,))
                    sub13 = cursor.fetchall()
                    cursor.close()

                    return render_template("page/home/index.html", title="Welcome", win="sub21", sub11=sub11, sub12=sub12, sub13=sub13)
            return redirect(url_for('homepage'))

        # @app.route("/status", methods=['GET', 'POST'])
        # def status():
        #     if request.method == 'POST':
        #         if request.form['btnprv'] == 'Clear':
        #             cursor = mysql.connection.cursor()
        #             cursor.execute("delete from gigTbl")
        #             mysql.connection.commit()
        #             cursor.close()
        #             return render_template("page/home/index.html", title="Welcome", win="sub12")

        #         if request.form['btnprv'] == 'Preview':
        #             cursor = mysql.connection.cursor()
        #             cursor.execute(''' SELECT * FROM gigTbl ''')
        #             prv = cursor.fetchall()
        #             cursor.close()
        #             return render_template("page/home/index.html", title="Welcome", win="prv", prv=prv)

        #     return redirect(url_for('homepage'))

        @app.errorhandler(400)
        def page_not_found(error):
            return render_template("page/errors/400.html", title="Page Not Found"), 400

        return app
