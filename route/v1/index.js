var express = require("express");
var app = express.Router();

const {
  isNull,
  isNotNull,
  makeEnum,
  isIncludeEnum,
} = require("../../lib/util");
const dateUtil = require("../../lib/dateUtil");
const Message = require("../../lib/message");
const { Op, fn } = require("sequelize");

// const xlsx = require("xlsx");
const axios = require("axios");
const dayjs = require("dayjs");
const _ = require("lodash");

app.get("/imgdownload", function (req, res) {
  const full_url = req.img_url;
  const fileName = Math.floor(new Date().getTime());
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`); // 이게 핵심 
  res.download(full_url); 
});

app.get("/init", async (req, res, next) => {
  // try {
  //   var message = new Message(0, { message: "Success" });
  //   res.return(200, message);
  // } catch (error) {
  //   res.returnError(error);
  // }

  // await req.model.Lecture.sync({ force: true });
  // await req.model.LectureReq.sync({ force: true });

  // 1	0	75289f8e-72c0-4b85-b3cf-f531b6ccf190	test1000@ruu.kr	student	test1000	연세대	수의학과	01000001111	1	0				2020-09-03 14:51:10	2020-09-03 14:51:10
  // 2	0	cef12ff7-c12a-431a-8fff-f240655e1a5b	test1001@ruu.kr	doctor	test1001	고려대	의예과	01000001112	2	0				2020-09-03 14:54:49	2020-09-03 14:54:49

  // const user = await req.model.User.create(
  //   {
  //     username: "alice123",
  //     isAdmin: true,
  //   },
  //   { fields: ["username"] }
  // );

  // await req.model.User.update(
  //   { del_dt: new Date() },
  //   {
  //     where: {
  //       // user_email: "test2005@ruu.kr",
  //       user_type: "doctor",
  //     },
  //   }
  // );
  // res.returnWrongParameter();

  try {
    // await req.model.User.sync({ force: true });
    // // await req.model.User.sync({ alter: true });
    // // await req.model.User.sync({});
    // for (let index = 1; index < 101; index++) {
    //   //console.log();
    //   var indexPad = index.toString().padStart(3, "0");
    //   var user = await req.model.User.create({
    //     // user_status : 0,
    //     user_id: "cef12ff7-c12a-431a-8fff-f240655e1" + indexPad,
    //     user_email: `test2${indexPad}@ruu.kr`,
    //     user_type: "doctor",
    //     user_name: `test2${indexPad}`,
    //     user_division: "고려대",
    //     user_department_no: 50,
    //     user_faculty_no: 51,
    //     mobile_no: "01000001" + indexPad,
    //     user_verify_img_no: 10 + index,
    //   });

    //   // //console.log("data", user.toJSON());
    //   // user.user_division = "고려대3";
    //   // await user.save();
    // }

    // var user = await req.model.User.create({
    //   // user_status : 0,
    //   user_id: "75289f8e-72c0-4b85-b3cf-f531b6ccf190",
    //   user_email: `test1000@ruu.kr`,
    //   user_type: "student",
    //   user_name: `test1000`,
    //   user_division: "연세대",
    //   user_department_no: 57,
    //   user_faculty_no: 64,
    //   mobile_no: "01000001000",
    //   lecturer_status: 1,
    //   user_verify_img_no: 4,
    // });

    // var user = await req.model.User.create({
    //   // user_status : 0,
    //   user_id: "cef12ff7-c12a-431a-8fff-f240655e1a5b",
    //   user_email: `test1001@ruu.kr`,
    //   user_type: "student",
    //   user_name: `test1001`,
    //   user_division: "한양대",
    //   user_department_no: 80,
    //   user_faculty_no: 81,
    //   mobile_no: "01000001111",
    //   lecturer_status: 1,
    //   user_verify_img_no: 3,
    // });

    // await req.model.Lecture.sync({ force: true });
    // await req.model.LectureContent.sync({ force: true });

    // // // // // // // await req.model.Lecture.sync({ alter: true });
    // // // // // // // // await req.model.LectureReq.sync({ force: true });

    // var start = 1;
    // var offset = 30;

    // var localeArray = ["ko-KR", "en-US"];

    // var lecture_video_preview_img_no = 103;

    // var departmentArray = await req.model.Code.findAll({
    //   where: {
    //     code_type: "department",
    //   },
    // });

    // //console.log("departmentArray", departmentArray);

    // var lecuteImageArray = [83, 84, 85, 86, 87, 88, 89, 90, 91];

    // var lecture_department_no = 0;
    // var lecture_department_name = "";

    // for (let index = 0; index < departmentArray.length; index++) {
    //   lecture_department_no = departmentArray[index].code_no;
    //   lecture_department_name = departmentArray[index].code_id;
    //   //console.log("lecture_department_name", lecture_department_name);

    //   var facultyArray = await req.model.Code.findAll({
    //     where: {
    //       code_type: "faculty",
    //       parent_code_no: lecture_department_no,
    //     },
    //   });

    //   //console.log("facultyArray", facultyArray);

    //   for (let k = 0; k < facultyArray.length; k++) {
    //     var lecture_faculty_no = facultyArray[k].code_no;
    //     var lecture_faculty_name = facultyArray[k].code_id;

    //     var user_no = k % 2 == 0 ? 167 : 166;
    //     var make_user_no = k % 2 == 0 ? 101 : 102;

    //     for (let j = start; j <= start * offset; j++) {
    //       var lecture_type = index % 2 == 0 ? "video" : "live";

    //       var indexPad = j.toString().padStart(3, "0");
    //       var lecture = await req.model.Lecture.create({
    //         // user_status : 0,
    //         lecture_type,
    //         lecture_department_no: lecture_department_no,
    //         lecture_faculty_no: lecture_faculty_no,
    //         user_no: user_no,
    //         make_user_no: make_user_no,
    //         live_begin_dt: new Date(),
    //         // end_dt: new Date(new Date() + 3600 * 24 * 7),
    //         lecture_vimeo_url: "https://vimeo.com/451694238",
    //         lecture_chat_url: "https://vimeo.com/event/236348/chat/0c822013ab",
    //         // lecture_title: `강의 ${lecture_department_name}  ${lecture_faculty_name}  ${indexPad}`,
    //         // lecture_content: `내용 ${lecture_department_name}  ${lecture_faculty_name}   ${indexPad}`,
    //         // lecture_abstract_title: `소제목 ${lecture_department_name}  ${lecture_faculty_name}  ${indexPad}`,
    //         // lecture_abstract_content: `소내용 ${lecture_department_name}  ${lecture_faculty_name}  ${indexPad}`,
    //         lecture_video_preview_img_no:
    //           lecuteImageArray[
    //             Math.floor(Math.random() * lecuteImageArray.length)
    //           ],
    //         view_count: 10 + j,
    //         lecture_state: 1,
    //         best_bare_order_weight: j * 3 + 5,
    //         play_time: 3600 + j * 3 + 5,
    //       });

    //       for (let j = 0; j < localeArray.length; j++) {
    //         const locale = localeArray[j];

    //         // TODO: lectureContent 부터 작업

    //         var lectureContent = await req.model.LectureContent.create({
    //           lecture_no: lecture.lecture_no,
    //           locale: locale,
    //           lecture_title: `${locale} 강의 ${lecture_department_name}  ${lecture_faculty_name}  ${indexPad}`,
    //           lecture_content: `${locale} 내용 ${lecture_department_name}  ${lecture_faculty_name}   ${indexPad}`,
    //           lecture_abstract_title: `${locale} 소제목 ${lecture_department_name}  ${lecture_faculty_name}  ${indexPad}`,
    //           lecture_abstract_content: `${locale} 소내용 ${lecture_department_name}  ${lecture_faculty_name}  ${indexPad}`,
    //         });
    //       }
    //     }
    //   }
    // }

    //////

    // for (let k = 1; k < departmentArray.length; k++) {
    //   var lecture_department_no = k;

    //   var user_no = k % 2 == 0 ? 101 : 102;

    //   for (let index = start; index <= start * offset; index++) {
    //     var lecture_type = index % 2 == 0 ? "video" : "live";

    //     var indexPad = index.toString().padStart(3, "0");
    //     var lecture = await req.model.Lecture.create({
    //       // user_status : 0,
    //       lecture_type,
    //       lecture_department_no: lecture_department_no,
    //       lecture_faculty_no: 15,
    //       user_no: user_no,
    //       live_begin_dt: new Date(),
    //       // end_dt: new Date(new Date() + 3600 * 24 * 7),
    //       lecture_vimeo_url: "https://vimeo.com/event/236348/0c822013ab",
    //       lecture_chat_url: "https://vimeo.com/event/236348/chat/0c822013ab",
    //       lecture_title: `${departmentArray[lecture_department_no]} 강의 ${indexPad}`,
    //       lecture_content: `${departmentArray[lecture_department_no]} 내용  ${indexPad}`,
    //       lecture_abstract_title: `${departmentArray[lecture_department_no]} 소제목 ${indexPad}`,
    //       lecture_abstract_content: `${departmentArray[lecture_department_no]} 소내용  ${indexPad}`,
    //       lecture_video_preview_img_no: lecture_video_preview_img_no,
    //       view_count: 10 + index,
    //     });
    //   }
    // }

    // for (const key in facultyArray) {
    //   const faculty = facultyArray[key];

    // var code = await req.model.Code.create({
    //   code_id: faculty.departments[0],
    //   code_type: "department",
    //   code_description: "",
    //   code_information: {
    //     ko: faculty.departments[0],
    //   },
    //   user_no: 1,
    //   code_state: 1,
    // });

    // var parent_code_no = code.code_no;

    // for (const index in faculty.facultys) {
    //   const facultyInfo = faculty.facultys[index];

    //   var code = await req.model.Code.create({
    //     code_id: facultyInfo[0],
    //     parent_code_no: parent_code_no,
    //     code_type: "faculty",
    //     code_description: "",
    //     code_information: {
    //       ko: facultyInfo[0],
    //     },
    //     user_no: 1,
    //     code_state: 1,
    //   });
    // }
    // }

    // var departmentArray = [
    //   "임시",
    //   "전체",
    //   "내과",
    //   "외과",
    //   "재활과",
    //   "심장혈관과",
    //   "안과",
    //   "수의학과",
    // ];

    // var start = 1;
    // var offset = 30;

    // var lecture_video_preview_img_no = 103;

    // for (let k = 1; k < departmentArray.length; k++) {
    //   var lecture_department_no = k;

    //   var user_no = k % 2 == 0 ? 101 : 102;

    //   for (let index = start; index <= start * offset; index++) {
    //     var lecture_type = index % 2 == 0 ? "video" : "live";

    //     var indexPad = index.toString().padStart(3, "0");
    //     var lecture = await req.model.Lecture.create({
    //       // user_status : 0,
    //       lecture_type,
    //       lecture_department_no: lecture_department_no,
    //       lecture_faculty_no: 15,
    //       user_no: user_no,
    //       live_begin_dt: new Date(),
    //       // end_dt: new Date(new Date() + 3600 * 24 * 7),
    //       lecture_vimeo_url: "https://vimeo.com/event/236348/0c822013ab",
    //       lecture_chat_url: "https://vimeo.com/event/236348/chat/0c822013ab",
    //       lecture_title: `${departmentArray[lecture_department_no]} 강의 ${indexPad}`,
    //       lecture_content: `${departmentArray[lecture_department_no]} 내용  ${indexPad}`,
    //       lecture_abstract_title: `${departmentArray[lecture_department_no]} 소제목 ${indexPad}`,
    //       lecture_abstract_content: `${departmentArray[lecture_department_no]} 소내용  ${indexPad}`,
    //       lecture_video_preview_img_no: lecture_video_preview_img_no,
    //       view_count: 10 + index,
    //     });
    //   }
    // }

    // await req.model.LectureReg.sync({ force: true });
    // await req.model.LectureReg.sync({ alter: true });
    // await req.model.LectureReg.sync({ force: true });

    // var indexPad = index.toString().padStart(3, "0");
    // var lectureReq = await req.model.LectureReq.create({
    //   user_no: 101,
    //   lecture_no: 13,
    //   payment_type: "CARD",
    //   reg_lecture_state: 1,
    //   possible_date: 10,
    // });
    // //console.log("lectureReq", lectureReq);

    // await req.model.PaymentHistory.sync({ force: true });

    // var lectureReq = await req.model.PaymentHistory.create({
    //   reg_lecture_no: 1,
    //   user_no: 101,
    //   lecture_no: 13,
    //   payment_type: "CARD",
    //   payment_data: {
    //     test: "data",
    //     test1: "123",
    //   },
    // });
    // //console.log("lectureReq", lectureReq);

    // await req.model.PriceHistory.sync({ force: true });

    // var priceHistory = await req.model.PriceHistory.create({
    //   // price_history_no: 1,
    //   user_no: 101,
    //   lecture_no: 13,
    //   original_price: 300000,
    //   real_price: 300000,
    //   share_rate_to_lecturer: 50,
    // });

    // //console.log("priceHistory", priceHistory);

    // await req.model.Inquiry.sync({ force: true });

    ////////

    // await req.model.Lecturer.sync({ force: true });
    //     await req.model.LecturerContent.sync({ force: true });

    //     var [record, created] = await req.model.Lecturer.upsert(
    //       {
    //         user_no: 101,
    //         lecturer_department_no: 57,
    //         lecturer_introduction_img_no: 6,
    //         bank_code_no: 72,
    //         account_number: "1101111111111",
    //       },
    //       {
    //         // returning: ["user_no"],
    //         returning: true,
    //       }
    //     );

    //     var [record, created] = await req.model.LecturerContent.upsert(
    //       {
    //         user_no: 101,
    //         locale: "ko-KR",
    //         lecturer_division: "서울대 교수 소속",
    //         lecturer_name: "홍길동",
    //         lecturer_title: "박사",
    //         lecturer_career: `
    //     서울대 내과 내과학 박사
    //     - 서울고
    //     - 서울중
    //     - 서울초
    //         `,
    //         lecturer_abstract_title: "셀럽 전문 강사의 실전 활용 중심 강의",
    //         lecturer_abstract_content: `
    // 내용
    //         `,
    //       },
    //       {
    //         // returning: ["user_no"],
    //         returning: true,
    //       }
    //     );

    //     var [record, created] = await req.model.LecturerContent.upsert(
    //       {
    //         user_no: 101,
    //         locale: "en-US",
    //         lecturer_division: "Seoul National University 교수 소속",
    //         lecturer_name: "홍길동",
    //         lecturer_title: "박사",
    //         lecturer_career: `
    //     Seoul National University 내과 내과학 박사
    //     - 서울고
    //     - 서울중
    //     - 서울초
    //         `,
    //         lecturer_abstract_title: "en-US 셀럽 전문 강사의 실전 활용 중심 강의",
    //         lecturer_abstract_content: `
    //   contnent
    //         `,
    //       },
    //       {
    //         // returning: ["user_no"],
    //         returning: true,
    //       }
    //     );

    //     //     //console.log("data", record.get());

    //     var [record, created] = await req.model.Lecturer.upsert(
    //       {
    //         user_no: 102,
    //         lecturer_department_no: 80,
    //         lecturer_introduction_img_no: 107,
    //         bank_code_no: 73,
    //         account_number: "1101111111111",
    //       },
    //       {
    //         // returning: ["user_no"],
    //         returning: true,
    //       }
    //     );

    //     var [record, created] = await req.model.LecturerContent.upsert(
    //       {
    //         user_no: 102,
    //         locale: "ko-KR",
    //         lecturer_division: "서울대 교수 소속",
    //         lecturer_name: "한석규",
    //         lecturer_title: "박사",
    //         lecturer_career: `
    //     서울대 내과 내과학 박사
    //     - 중앙고
    //     - 중앙중
    //     - 중앙초
    //         `,
    //         lecturer_abstract_title: "풍푸한 경험을 토대로한 핵심 강의",
    //         lecturer_abstract_content: `
    // 내용
    //         `,
    //       },
    //       {
    //         // returning: ["user_no"],
    //         returning: true,
    //       }
    //     );

    //     var [record, created] = await req.model.LecturerContent.upsert(
    //       {
    //         user_no: 102,
    //         locale: "en-US",
    //         lecturer_division: "Chung-Ang University 교수 소속",
    //         lecturer_name: "한석규",
    //         lecturer_title: "박사",
    //         lecturer_career: `
    //     Chung-Ang University 내과 내과학 박사
    //     - 중앙고
    //     - 중앙중
    //     - 중앙초
    //         `,
    //         lecturer_abstract_title: "en-US 풍푸한 경험을 토대로한 핵심 강의",
    //         lecturer_abstract_content: `
    // contnent
    //         `,
    //       },
    //       {
    //         // returning: ["user_no"],
    //         returning: true,
    //       }
    //     );

    //     //console.log("data", record.get());

    // var [record, created] = await req.model.Lecturer.upsert(
    //   {
    //     user_no: 166,
    //     lecturer_department_no: 57,
    //     lecturer_introduction_img_no: 6,
    //     bank_code_no: 72,
    //     account_number: "1101111111111",
    //   },
    //   {
    //     // returning: ["user_no"],
    //     returning: true,
    //   }
    // );

    // var [record, created] = await req.model.LecturerContent.upsert(
    //   {
    //     user_no: 166,
    //     locale: "ko-KR",
    //     lecturer_division: "하버드 교수 소속",
    //     lecturer_name: "박하버드",
    //     lecturer_title: "박사",
    //     lecturer_career: `
    //     하버드 내과 내과학 박사
    //     - 하버드고
    //     - 하버드중
    //     - 하버드초
    //         `,
    //     lecturer_abstract_title: "셀럽 전문 강사의 실전 활용 중심 강의",
    //     lecturer_abstract_content: `
    // 내용
    //         `,
    //   },
    //   {
    //     // returning: ["user_no"],
    //     returning: true,
    //   }
    // );

    // var [record, created] = await req.model.LecturerContent.upsert(
    //   {
    //     user_no: 166,
    //     locale: "en-US",
    //     lecturer_division: "Harvard College 교수 소속",
    //     lecturer_name: "박하버드",
    //     lecturer_title: "박사",
    //     lecturer_career: `
    //     Harvard College 내과 내과학 박사
    //     - 서울고
    //     - 서울중
    //     - 서울초
    //         `,
    //     lecturer_abstract_title: "en-US 셀럽 전문 강사의 실전 활용 중심 강의",
    //     lecturer_abstract_content: `
    //   contnent
    //         `,
    //   },
    //   {
    //     // returning: ["user_no"],
    //     returning: true,
    //   }
    // );

    // //     //console.log("data", record.get());

    // var [record, created] = await req.model.Lecturer.upsert(
    //   {
    //     user_no: 167,
    //     lecturer_department_no: 80,
    //     lecturer_introduction_img_no: 107,
    //     bank_code_no: 73,
    //     account_number: "1101111111111",
    //   },
    //   {
    //     // returning: ["user_no"],
    //     returning: true,
    //   }
    // );

    // var [record, created] = await req.model.LecturerContent.upsert(
    //   {
    //     user_no: 167,
    //     locale: "ko-KR",
    //     lecturer_division: "예일대 교수 소속",
    //     lecturer_name: "김예일",
    //     lecturer_title: "박사",
    //     lecturer_career: `
    //     예일대 내과 내과학 박사
    //     - 중앙고
    //     - 중앙중
    //     - 중앙초
    //         `,
    //     lecturer_abstract_title: "풍푸한 경험을 토대로한 핵심 강의",
    //     lecturer_abstract_content: `
    // 내용
    //         `,
    //   },
    //   {
    //     // returning: ["user_no"],
    //     returning: true,
    //   }
    // );

    // var [record, created] = await req.model.LecturerContent.upsert(
    //   {
    //     user_no: 167,
    //     locale: "en-US",
    //     lecturer_division: "Yale University 교수 소속",
    //     lecturer_name: "김예일",
    //     lecturer_title: "박사",
    //     lecturer_career: `
    //     Yale University 내과 내과학 박사
    //     - 중앙고
    //     - 중앙중
    //     - 중앙초
    //         `,
    //     lecturer_abstract_title: "en-US 풍푸한 경험을 토대로한 핵심 강의",
    //     lecturer_abstract_content: `
    // contnent
    //         `,
    //   },
    //   {
    //     // returning: ["user_no"],
    //     returning: true,
    //   }
    // );

    // //console.log("data", record.get());

    ///////////////////////////

    // await req.model.Image.sync({ force: true });

    // var Image = await req.model.Image.create({
    //   user_no: 101,
    //   image_type: "IN",
    //   file_path: "/public/image/test-123-123",
    // });

    // for (let index = 0; index < 100; index++) {
    //   //console.log();
    //   var indexPad = index.toString().padStart(3, "0");
    //   var image = await req.model.Image.create({
    //     user_no: index,
    //     image_type: "IN",
    //     file_path: "profile/a0deb216-517a-42d1-8332-d648b3278ba6.png",
    //   });
    // }

    // //console.log("Image", Image);

    // await req.model.Video.sync({ force: true });
    // var video = await req.model.Video.create({
    //   user_no: 101,
    //   video_type: "IN",
    //   file_path: "/public/video/test-123-123",
    // });

    // //console.log("Image", video);

    // await req.model.Notice.sync({ force: true });

    // // var notice = await req.model.Notice.create({
    // //   user_no: 101,
    // //   notice_type: "IN",
    // //   notice_state: "1",
    // //   notice_title: "공지 제목",
    // //   notice_content: "공지 내용",
    // //   // view_count : "공지 제목",
    // // });

    // for (let index = 1; index <= 100; index++) {
    //   var indexPad = index.toString().padStart(3, "0");

    //   var notice = await req.model.Notice.create({
    //     user_no: 101,
    //     notice_type: "IN",
    //     notice_state: "0",
    //     notice_title: `공지 제목 ${indexPad}`,
    //     notice_content: `공지 내용 ${indexPad}`,
    //     notice_order_weight: index,
    //   });
    // }

    // //console.log("notice", notice);

    // await req.model.Tag.sync({ force: true });

    // var [tag, created] = await req.model.Tag.findOrCreate({
    //   where: { tag_name: "천식" },
    //   defaults: {
    //     user_no: 0,
    //     tag_type: "IN",
    //     tag_name: "천식",
    //   },
    // });

    // var [tag, created] = await req.model.Tag.findOrCreate({
    //   where: { tag_name: "감기" },
    //   defaults: {
    //     user_no: 0,
    //     tag_type: "IN",
    //     tag_name: "감기",
    //   },
    // });

    // var [tag, created] = await req.model.Tag.findOrCreate({
    //   where: { tag_name: "진료과" },
    //   defaults: {
    //     user_no: 0,
    //     tag_type: "IN",
    //     tag_name: "진료과",
    //   },
    // });

    // var [tag, created] = await req.model.Tag.findOrCreate({
    //   where: { tag_name: "코로나" },
    //   defaults: {
    //     user_no: 0,
    //     tag_type: "IN",
    //     tag_name: "코로나",
    //   },
    // });

    // //console.log("tag", tag.get());

    // await req.model.Feed.sync({ force: true });

    // // // // var feed = await req.model.Feed.create({
    // // // //   // feed_status : 0,
    // // // //   feed_type: "IN",
    // // // //   user_no: "101",
    // // // //   feed_division: "내과",
    // // // //   feed_department: "신장",
    // // // //   feed_title: "라이브스터디 강의 언제 어디서든 들어요~",
    // // // //   feed_content: `라이브스터디 강의 언제 어디서든 들어요 ~
    // // // //     해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 ?`,
    // // // //   feed_img_no: 13,
    // // // // });

    // for (let index = 1; index < 101; index++) {
    //   //console.log();
    //   var indexPad = index.toString().padStart(3, "0");
    //   var lecture = await req.model.Feed.create({
    //     // user_status : 0,
    //     locale: "ko-KR",
    //     feed_type: "IN",
    //     user_no: index,
    //     feed_department_no: 57,
    //     feed_faculty_no: 63,
    //     feed_title: `라이브스터디 강의 언제 어디서든 들어요~  ${indexPad}`,
    //     feed_content: `라이브스터디 강의 언제 어디서든 들어요 ~ ${indexPad}
    //     해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 해부학 수업이 이해가지않았는데 ?`,
    //     feed_img_no: index,
    //     view_count: 10 + index,
    //     feed_order_weight: index,
    //     feed_status: 1,
    //   });
    // }

    // //console.log("feed", feed);

    // await req.model.FeedComment.sync({ force: true });

    // var feedComment = await req.model.FeedComment.create({
    //   feed_no: 1,
    //   user_no: 101,
    //   feed_type: "IN",
    //   feed_comment_content: `댓글 입니다 댓글 댓글 댓글 입니다 댓글 댓글 댓글 입니다 댓글 댓글`,
    // });

    // //console.log("feed", feedComment);

    // await req.model.FAQ.sync({ force: true });

    // for (let index = 1; index < 10; index++) {
    //   var indexPad = index.toString().padStart(3, "0");
    //   var faq = await req.model.FAQ.create({
    //     // user_status : 0,
    //     faq_type: "IN",
    //     user_no: index,
    //     faq_title: `라이브방송 시청에 대한 안내  ${indexPad}`,
    //     faq_content: `${indexPad}
    // 라이브스터디 강의는 크롬으로 시청하시길 권장 드립니다.
    // 익스플로워 시청시 채팅창이 끊길수 있으며 화질 고르지 못한 점 양해 부탁드립니다.
    // 또한 라이브 방송 입장시 auto로 설정이 되어있을 수 있으니 톱니바퀴 모양을 눌러 1080p로 변경하여 시청해주시길 바랍니다.
    // 라이브스터디 강의는 크롬으로 시청하시길 권장 드립니다.
    // 익스플로워 시청시 채팅창이 끊길수 있으며 화질 고르지 못한 점 양해 부탁드립니다.`,
    //     view_count: 10 + index,
    //     faq_order_weight: index * 10,
    //     locale: "ko-KR",
    //     faq_status: 1,
    //   });

    //   var faq = await req.model.FAQ.create({
    //     // user_status : 0,
    //     faq_type: "IN",
    //     user_no: index,
    //     faq_title: `en 라이브방송 시청에 대한 안내  ${indexPad}`,
    //     faq_content: `en ${indexPad}
    // 라이브스터디 강의는 크롬으로 시청하시길 권장 드립니다.
    // 익스플로워 시청시 채팅창이 끊길수 있으며 화질 고르지 못한 점 양해 부탁드립니다.
    // 또한 라이브 방송 입장시 auto로 설정이 되어있을 수 있으니 톱니바퀴 모양을 눌러 1080p로 변경하여 시청해주시길 바랍니다.
    // 라이브스터디 강의는 크롬으로 시청하시길 권장 드립니다.
    // 익스플로워 시청시 채팅창이 끊길수 있으며 화질 고르지 못한 점 양해 부탁드립니다.`,
    //     view_count: 10 + index,
    //     faq_order_weight: index * 10,
    //     locale: "en-US",
    //     faq_status: 1,
    //   });
    // }

    // await req.model.Code.sync({ force: true });

    // var monetary_unit_array = [
    //   ["₩", "원", "KRW"],
    //   ["%", "달러", "USD"],
    // ];

    // for (const key in monetary_unit_array) {
    //   const faculty = monetary_unit_array[key];

    //   var code = await req.model.Code.create({
    //     code_id: faculty[0],
    //     code_type: "monetary_unit",
    //     code_description: "",
    //     code_information: {
    //       ko: faculty[1],
    //       en: faculty[2],
    //     },
    //     user_no: 1,
    //     code_state: 1,
    //   });
    // }

    // var monetary_unit_array = [
    //   ["신용카드", "신용카드", "CARD"],
    //   ["현금", "현금", "MONEY"],
    // ];

    // for (const key in monetary_unit_array) {
    //   const faculty = monetary_unit_array[key];

    //   var code = await req.model.Code.create({
    //     code_id: faculty[0],
    //     code_type: "payment_type",
    //     code_description: "",
    //     code_information: {
    //       ko: faculty[1],
    //       en: faculty[2],
    //     },
    //     user_no: 1,
    //     code_state: 1,
    //   });
    // }

    // var bank_code_array = [
    //   { name: "카카오뱅크", code: "090" },
    //   { name: "신한은행", code: "088" },
    //   { name: "기업은행", code: "003" },
    //   { name: "국민은행", code: "004" },
    //   { name: "우리은행", code: "020" },
    //   { name: "KEB하나은행", code: "081" },
    //   { name: "농협", code: "011" },
    //   { name: "지역농축협", code: "012" },
    //   { name: "SC은행", code: "023" },
    //   { name: "씨티은행", code: "027" },
    //   { name: "우체국", code: "071" },
    //   { name: "경남은행", code: "039" },
    //   { name: "광주은행", code: "034" },
    //   { name: "대구은행", code: "031" },
    //   { name: "도이치", code: "055" },
    //   { name: "부산은행", code: "032" },
    //   { name: "산업은행", code: "002" },
    //   { name: "상호저축은행", code: "050" },
    //   { name: "새마을금고", code: "045" },
    //   { name: "산림조합", code: "064" },
    //   { name: "수협", code: "007" },
    //   { name: "신협", code: "048" },
    //   { name: "전북은행", code: "037" },
    //   { name: "제주은행", code: "035" },
    //   { name: "HSBC", code: "054" },
    //   { name: "케이뱅크", code: "089" },
    // ];

    // for (const key in bank_code_array) {
    //   const bank_code = bank_code_array[key];

    //   var code = await req.model.Code.create({
    //     code_id: bank_code["code"],
    //     code_type: "bank_code",
    //     code_description: "",
    //     code_information: {
    //       "ko-KR": bank_code["name"],
    //       // "en-US": bank_code["name"],
    //       // en: faculty[2],
    //     },
    //     user_no: 1,
    //     code_state: 1,
    //   });
    // }

    // var departmentArray = ["임상각과", "외과", "내과", "치의학", "수의학과"];

    // for (const key in departmentArray) {
    //   const department = departmentArray[key];
    // }

    // var facultyArray = [
    //   {
    //     departments: ["임상각과"],
    //     facultys: [
    //       ["가정의학과"],
    //       ["비뇨의학과"],
    //       ["산부인과"],
    //       ["신경과"],
    //       ["영상의학과"],
    //       ["응급의학과"],
    //       ["이비인후과"],
    //       ["임상약리학과"],
    //       ["정신건강의학과"],
    //       ["진단검사의학과"],
    //       ["피부과"],
    //       ["핵의학과"],
    //       ["마취통증의학과"],
    //       ["병리과"],
    //       ["방사선종약학과"],
    //       ["비뇨기과"],
    //       ["안과"],
    //       ["재활의학과"],
    //     ],
    //   },
    //   {
    //     departments: ["외과"],
    //     facultys: [
    //       ["일반외과"],
    //       ["신경외과"],
    //       ["정형외과"],
    //       ["흉부외과"],
    //       ["성형외과"],
    //       ["유방외과"],
    //     ],
    //   },
    //   {
    //     departments: ["내과"],
    //     facultys: [
    //       ["심장학"],
    //       ["소화기"],
    //       ["순환지"],
    //       ["혈액학"],
    //       ["감염학"],
    //       ["알레르기면역"],
    //       ["내과"],
    //       ["내분비학"],
    //       ["호흡기"],
    //       ["신장학"],
    //       ["혈액종양학"],
    //     ],
    //   },
    //   {
    //     departments: ["치의학"],
    //     facultys: [
    //       ["보철과"],
    //       ["교정과"],
    //       ["치주과"],
    //       ["소아치과"],
    //       ["보존과"],
    //       ["영상치의학"],
    //       ["구강악안면외과"],
    //       ["구강내과"],
    //       ["구강병리과"],
    //       ["마취과"],
    //     ],
    //   },
    //   {
    //     departments: ["수의학과"],
    //     facultys: [["수의학"]],
    //   },
    // ];

    // for (const key in facultyArray) {
    //   const faculty = facultyArray[key];

    //   var code = await req.model.Code.create({
    //     code_id: faculty.departments[0],
    //     code_type: "department",
    //     code_description: "",
    //     code_information: {
    //       "ko-KR": faculty.departments[0],
    //     },
    //     user_no: 1,
    //     code_state: 1,
    //   });

    //   var parent_code_no = code.code_no;

    //   for (const index in faculty.facultys) {
    //     const facultyInfo = faculty.facultys[index];

    //     var code = await req.model.Code.create({
    //       code_id: facultyInfo[0],
    //       parent_code_no: parent_code_no,
    //       code_type: "faculty",
    //       code_description: "",
    //       code_information: {
    //         "ko-KR": facultyInfo[0],
    //       },
    //       user_no: 1,
    //       code_state: 1,
    //     });
    //   }
    // }

    // await req.model.LectureTag.sync({ force: true });

    // var lectureTag = await req.model.LectureTag.create({
    //   tag_no: 1,
    //   lecture_no: 1,
    //   user_no: 1,
    //   lecture_tag_type: "IN",
    // });

    // var lectureTag = await req.model.LectureTag.create({
    //   tag_no: 1,
    //   lecture_no: 2,
    //   user_no: 1,
    //   lecture_tag_type: "IN",
    // });

    // var lectureTag = await req.model.LectureTag.create({
    //   tag_no: 1,
    //   lecture_no: 3,
    //   user_no: 1,
    //   lecture_tag_type: "IN",
    // });

    // var lectureTag = await req.model.LectureTag.create({
    //   tag_no: 2,
    //   lecture_no: 1,
    //   user_no: 1,
    //   lecture_tag_type: "IN",
    // });

    // //console.log("lectureTag", lectureTag);

    // await req.model.Disease.sync({ force: true });

    // var dataArray = ["감기", "천식", "알레르기"];

    // for (const key in dataArray) {
    //   const data = dataArray[key];

    //   var lectureDisease = await req.model.Disease.create({
    //     user_no: 1,
    //     disease_type: "IN",
    //     disease_name: data,
    //   });
    // }

    // await req.model.LectureDisease.sync({ force: true });

    // var lectureTag = await req.model.LectureDisease.create({
    //   disease_no: 1,
    //   lecture_no: 1,
    //   user_no: 1,
    //   lecture_disease_type: "IN",
    // });

    // var lectureTag = await req.model.LectureDisease.create({
    //   disease_no: 1,
    //   lecture_no: 2,
    //   user_no: 1,
    //   lecture_disease_type: "IN",
    // });

    // var lectureTag = await req.model.LectureDisease.create({
    //   disease_no: 1,
    //   lecture_no: 3,
    //   user_no: 1,
    //   lecture_disease_type: "IN",
    // });

    // var lectureTag = await req.model.LectureDisease.create({
    //   disease_no: 2,
    //   lecture_no: 1,
    //   user_no: 1,
    //   lecture_disease_type: "IN",
    // });

    // await req.model.Banner.sync({ force: true });

    // var banner = await req.model.Banner.create({
    //   user_no: 101,
    //   locale: "ko-KR",
    //   banner_type: "main", // "main" , "live" , "chat"
    //   banner_title: "메인 배너",
    //   banner_content: "메인 배너 내용",
    //   banner_state: 1,
    //   banner_order_weight: 10,
    //   banner_img_no: 97,
    // });

    // //console.log("banner", banner);

    // Content

    // await req.model.Content.sync({ force: true });

    // var content = await req.model.Content.create({
    //   user_no: 101,
    //   content_type: "terms",
    //   content_title: "약관 제목",
    //   content_content: `<p><span style="font-size: 30px;"><strong>약관 내용</strong></span></p>`,
    //   content_locale: "ko-KR",
    //   content_state: 1,
    // });

    // var content = await req.model.Content.create({
    //   user_no: 101,
    //   content_type: "terms",
    //   content_title: "terms title",
    //   content_content: `<p><span style="font-size: 30px;"><strong>terms Content</strong></span></p>`,
    //   content_locale: "en-US",
    //   content_state: 1,
    // });

    // var content = await req.model.Content.create({
    //   user_no: 101,
    //   content_type: "policy",
    //   content_title: "정책 제목",
    //   content_content: `<p><span style="font-size: 30px;"><strong>정책 내용</strong></span></p>`,
    //   content_locale: "ko-KR",
    //   content_state: 1,
    // });

    // var content = await req.model.Content.create({
    //   user_no: 101,
    //   content_type: "policy",
    //   content_title: "policy title",
    //   content_content: `<p><span style="font-size: 30px;"><strong>policy Content</strong></span></p>`,
    //   content_locale: "en-US",
    //   content_state: 1,
    // });
    // await req.model.Cart.sync({ force: true });

    // await req.model.PaymentTemp.sync({ force: true });

    // -----------------
    // CodeGroup
    // await req.model.CodeGroup.sync({ force: true });
    // var departmentArray = await req.model.Code.findAll({
    //   where: {
    //     code_type: "department",
    //   },
    // });

    // var code_group_type = "https://www.live-study.co.kr";

    // for (const key in departmentArray) {
    //   const department = departmentArray[key];
    //   //console.log("department", department);

    //   if (department.code_no !== 80 && department.code_no !== 100) {
    //     var temp = {
    //       code_group_type,
    //       code_no: department.code_no,
    //       code_type: department.code_type,
    //     };

    //     //console.log("temp", temp);

    //     var codeGroup = await req.model.CodeGroup.create(temp);
    //   }
    // }

    // var code_group_type = "https://www.live-vet.co.kr";

    // for (const key in departmentArray) {
    //   const department = departmentArray[key];
    //   //console.log("department", department);

    //   if (department.code_no === 80 || department.code_no === 100) {
    //     var temp = {
    //       code_group_type,
    //       code_no: department.code_no,
    //       code_type: department.code_type,
    //     };

    //     //console.log("temp", temp);

    //     var codeGroup = await req.model.CodeGroup.create(temp);
    //   }
    // }

    // var code_group_type = "https://cms.live-study.co.kr";
    // for (const key in departmentArray) {
    //   const department = departmentArray[key];
    //   //console.log("department", department);

    //   // if (department.code_no === 80 || department.code_no === 100) {
    //   var temp = {
    //     code_group_type,
    //     code_no: department.code_no,
    //     code_type: department.code_type,
    //   };

    //   //console.log("temp", temp);

    //   var codeGroup = await req.model.CodeGroup.create(temp);
    //   // }
    // }

    var message = new Message(0, { message: "Success" });
    res.return(200, message);
  } catch (error) {
    res.returnError(error);
  }
});

// db 테스트
app.get("/test_test_test", async function (req, res) {
  //console.log("log -> ---------------------------------------");
  //console.log("log -> ~  req.user_info", JSON.stringify(req.user_info));
  //console.log("log -> ---------------------------------------");

  // //console.log("log -> ---------------------------------");
  // //console.log("log -> ~ req.headers", req.headers);
  // //console.log("log -> ---------------------------------");

  var data = {
    test: "Test",
  };

  try {
    var selectQuery1 = `
        select
            datname
        from
            pg_database
        where
            datistemplate = false;
        `;

    data = await req.sequelize.query(selectQuery1, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // //console.log(data);

    // res.send("Hello love dawn 22 :" + JSON.stringify(data));
    res.json({
      msg: "ok",
      data,
    });
  } catch (error) {
    //console.log("PPAP: error", error);
    res.status(403).send({ msg: "wrong", error: error });
  }
});

// // cloud9 켜기
// app.get("/test_test_test2", async function (req, res) {
//   var data = {};
//   var params = {
//     // Filters: [
//     //     {
//     //         Name: "tag-key",
//     //         Values: [
//     //             "Name"
//     //         ]
//     //     }
//     // ]
//   };

//   // TODO: cloud9을 찾기 위한 로직
//   // Tags 에서  Name에 aws-cloud9-프로젝트명-개발환경으로 찾는다.

//   data = await req.ec2.ec2.describeInstances(params).promise();
//   var InstanceIds = [];
//   try {
//     for (const key in data.Reservations[0].Instances) {
//       if (
//         data.Reservations[0].Instances[key].Tags.filter((x) => {
//           return (
//             x.Key == "Name" &&
//             x.Value.includes(
//               `aws-cloud9-${envJson.projectName}-${envJson.projectEnv}`
//             )
//           ); //TODO: 임시 배포시 문제 해결 방안 고려
//         }).length > 0
//       ) {
//         InstanceIds.push(data.Reservations[0].Instances[key].InstanceId);
//         break;
//       }
//     }
//     //console.log(InstanceId);
//   } catch (error) {
//     //console.log(error);
//   }

//   if (InstanceIds.length != 1) {
//     res.status(500).json({ success: false, err: String("not found cloud9") });
//     return;
//   }

//   params = {
//     InstanceIds: InstanceIds,
//   };

//   data = await req.ec2.startInstances(params).promise();

//   res.send({
//     msg: "ok",
//     data: data,
//   });
// });

// app.get("/test_test_test3", async function (req, res) {
//   try {
//     // var data = await apiObject.getTest();

//     // var testUrl = `http://127.0.0.1:3306/v1/test_test_test`;
//     // var data = await axios.get(testUrl);

//     var testUrl = "https://api.nasdaq.com/api/quote/ARR/info?assetclass=stocks";
//     var data = await axios.get(testUrl, {
//       //   headers: {
//       //     "User-Agent":
//       //       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
//       //   },
//     });

//     //console.log("data", data.data);
//   } catch (e) {
//     //console.log("e", e);
//   }

//   res.send(
//     "test :" +
//       JSON.stringify({ test: new Date().toISOString(), data: data.data })
//   );
// });

// app.get("/test_test_test5", async function (req, res) {
//   //console.log("user_info", req.user_info);

//   var data = {
//     test: "Test",
//     user_pool: req.cognito.user_pool,
//     cognito_info: req.cognito_info,
//   };

//   var result = [];

//   let transaction;

//   if (req.user_no !== user_no) {
//     res.status(403).send({ msg: "wrong" });
//     return;
//   }

//   try {
//     // transaction = await req.sequelize.transaction();

//     // var qeury_Deactive = req.mybatisMapper.getStatement(
//     //     "XY",
//     //     "XY_00900.SELECT",
//     //     { user_id, user_no },
//     //     { language: "sql", indent: "  " }
//     // );

//     // var data_Deactive = await req.sequelize.query(qeury_Deactive, {
//     //     transaction: transaction,
//     //     type: req.sequelize.QueryTypes.SELECT,
//     // });

//     if (data_Deactive.length !== 1) {
//       throw new Error("wrong params");
//     }

//     // var deleteUser = await req.cognito.deleteUser({
//     //   username: req.user_id,
//     // });
//     // //console.log(deleteUser);

//     // await transaction.commit();

//     res.json({
//       msg: "test_test_test5 ok",
//       data,
//     });
//   } catch (error) {
//     if (error) await transaction.rollback();

//     //console.log("PPAP: error", error);
//     res.status(403).send({ msg: "wrong", error: error });
//   }
// });

// app.get("/test_test_test6", async function (req, res) {
//   var data = {
//     test: "Test",
//   };

//   try {
//     var sendEmail = await req.ses.sendEmail({
//       email: "test@ruu.kr", //req.user_info.email
//       msg: "<h2>123123123123</h2>", //
//       title: "싸이페어 인증메일입니다.", // 싸이페어 인증입니다.
//     });
//     // //console.log(sendEmail);

//     res.json({
//       msg: "test_test_test6 ok",
//       data,
//     });
//   } catch (error) {
//     //console.log("PPAP: error", error);
//     res.status(403).send({ msg: "wrong", error: error });
//   }
// });

// app.get("/test_test_test7", async function (req, res) {
//   var data = {
//     test: "Test",
//   };

//   try {
//     const selectQuery1 = req.mybatisMapper.getStatement(
//       "LS",
//       "TB_USER.SELECT.001",
//       {
//         // limit,
//         // announce_no,
//         // user_no
//         user_id: "9faa36eb-5965-1734-1f6a-12a0fe966120",
//         email: "test1010@ruu.kr",
//         // limit: 2,
//         // offset: 2,
//         // order_type: "user_department",
//         sort_type: "desc",
//         // user_type: "S",
//       },
//       { language: "sql", indent: "  " }
//     );

//     data = await req.sequelize.query(selectQuery1, {
//       type: req.sequelize.QueryTypes.SELECT,
//     });

//     // //console.log(data);

//     res.json({
//       msg: "ok",
//       data,
//     });
//   } catch (error) {
//     //console.log("PPAP: error", error);
//     res.status(403).send({ msg: "wrong", error: error });
//   }
// });

// app.get("/test_test_test8", async function (req, res) {
//   var data = {
//     test: "Test",
//   };

//   try {
//     const book = xlsx.utils.book_new();

//     // --------------------------------------------------------------------

//     // @breif 1번 시트

//     // @breif aoa_to_sheet 방식으로 데이터를 생성한다.

//     const doctors = xlsx.utils.aoa_to_sheet([
//       ["학과", "직급", "이름", "나이"],

//       ["흉부외과", "병원장", "주전", "67"],

//       ["흉부외과", "교수", "천명태", "52"],

//       ["흉부외과", "치프", "도재학", "39"],

//       ["소아외과", "레지던트", "장겨울", "29"],

//       ["산부인과", "레지던트", "추민하", "34"],

//       ["산부인과", "레지던트", "명은원", "28"],

//       ["신경외과", "교수", "민기준", "55"],

//       ["신경외과", "치프", "용석민", "33"],

//       ["신경외과", "레지던트", "안치홍", "38"],

//       ["신경외과", "레지던트", "허선빈", "31"],

//       ["응급의학과", "조교수", "봉광현", "40"],

//       ["응급의학과", "펠로우", "배준희", "31"],
//     ]);

//     // @breif CELL 넓이 지정

//     doctors["!cols"] = [
//       { wpx: 130 }, // A열

//       { wpx: 100 }, // B열

//       { wpx: 80 }, // C열

//       { wch: 60 }, // D열
//     ];

//     // @breif 첫번째 시트에 작성한 데이터를 넣는다.

//     xlsx.utils.book_append_sheet(book, doctors, "DOCTOR");

//     // --------------------------------------------------------------------

//     // @breif 2번 시트

//     // @details json_to_sheet 방식으로 데이터를 생성한다.

//     const nurses = xlsx.utils.json_to_sheet(
//       [
//         { A: "학과", B: "직급", C: "이름", D: "나이" },

//         { A: "흉부외과", B: "PA간호사", C: "소이현", D: "33" },

//         { A: "소아외과", B: "PA간호사", C: "한현희", D: "29" },

//         { A: "산부인과", B: "분만실간호사", C: "한한승주현희", D: "41" },

//         { A: "산부인과", B: "PA간호사", C: "은선진", D: "36" },

//         { A: "간담췌외과", B: "수간호사", C: "송수빈", D: "45" },

//         { A: "간담췌외과", B: "병동간호사", C: "이영하", D: "35" },

//         { A: "간담췌외과", B: "병동간호사", C: "김재환", D: "28" },

//         { A: "간담췌외과", B: "PA간호사", C: "국해성", D: "32" },

//         { A: "간담췌외과", B: "이식코디네이터", C: "함덕주", D: "37" },

//         { A: "신경외과", B: "PA간호사", C: "황재신", D: "39" },

//         { A: "응급의학과", B: "응급실간호사", C: "선우희수", D: "26" },
//       ],
//       { header: ["A", "B", "C", "D"], skipHeader: true }
//     );

//     // @breif CELL 넓이 지정

//     nurses["!cols"] = [
//       { wpx: 130 }, // A열

//       { wpx: 100 }, // B열

//       { wpx: 80 }, // C열

//       { wch: 60 }, // D열
//     ];

//     // @details 두번째 시트에 작성한 데이터를 넣는다.

//     xlsx.utils.book_append_sheet(book, nurses, "NURSES");

//     // --------------------------------------------------------------------

//     // @files 엑셀파일을 생성하고 저장한다.
//     // xlsx.writeFile(book, "dramatis_personae.xlsx");

//     const wbout = xlsx.write(book, { bookType: "xlsx", type: "buffer" });
//     var file = new Buffer(wbout);

//     var test = await req.s3.upload({
//       key: "private/test/test.xlsx",
//       bucket: "kl-dev-file",
//       data: file,
//       option: {
//         Expires: 300,
//         ACL: "private",
//       },
//     });

//     //console.log("test", test);

//     res.json({
//       msg: "ok",
//       data,
//     });
//   } catch (error) {
//     //console.log("PPAP: error", error);
//     res.status(403).send({ msg: "wrong", error: error });
//   }
// });

// app.get("/test_test_test9", async function (req, res) {
//   var data = {
//     test: "Test",
//   };

//   try {
//     const url = await req.s3.getSignedUrl({
//       key: "private/test/test.xlsx",
//       bucket: "kl-dev-file",
//       expires: 60,
//     });

//     //console.log("url", url);

//     res.json({
//       msg: "ok",
//       data,
//     });
//   } catch (error) {
//     //console.log("PPAP: error", error);
//     res.status(403).send({ msg: "wrong", error: error });
//   }
// });

// app.get("/test_test_test10", async function (req, res) {
//   var data = {
//     test: "Test",
//   };

//   try {
//     var sendSMS = await req.sms.sendSMS({
//       phone: "01041100746",
//       msg: "<h2>123123123123</h2>", //
//       title: "테스트 인증메일입니다.", // 싸이페어 인증입니다.
//     });

//     //console.log(sendSMS);

//     res.json({
//       msg: "test_test_test10 ok",
//       data,
//     });
//   } catch (error) {
//     //console.log("PPAP: error", error);
//     res.status(403).send({ msg: "wrong", error: error });
//   }
// });

// app.get("/test_test_test11", async function (req, res) {
//   var test1 = format(new Date(), "'Today is a' iiii");
//   //console.log(test1);

//   //=> "Today is a Monday"

//   var test2 = formatDistance(subDays(new Date(), 3), new Date());
//   //console.log(test2);
//   //=> "3 days ago"

//   var test3 = formatRelative(subDays(new Date(), 3), new Date());
//   //console.log(test3);

//   res.json({
//     msg: "test_test_test11 ok",
//   });
// });

// app.get("/test_test_test12", async function (req, res) {
//   var date = dayjs();
//   //console.log("date", date);

//   var date = dayjs().startOf("month");
//   //console.log("date", date);

//   var date = dayjs().endOf("month");
//   //console.log("date", date);

//   res.json({
//     msg: "test_test_test12 ok",
//   });
// });

// // var AWS = require("aws-sdk");
// // var s3 = new AWS.S3({
// //   region: "ap-northeast-1",
// // });

// // var multer = require("multer");
// // var multerS3 = require("multer-s3");

// // var upload = multer({
// //   storage: multerS3({
// //     s3: s3,
// //     bucket: "kl-dev-file",
// //     // metadata: function (req, file, cb) {
// //     //   //console.log("file", file);
// //     //   cb(null, { fieldName: file.fieldname });
// //     // },
// //     key: function (req, file, cb) {
// //       //console.log("file", file);
// //       req.originalname = file.originalname;
// //       cb(null, req.originalname);
// //     },
// //   }),
// // });

// // app.post("/test_test_test13", upload.array("file", 1), async function (
// //   req,
// //   res
// // ) {
// //   const params = {
// //     FunctionName: "ANOTHER_LAMBDA_NAME",
// //     Payload: JSON.stringify({ fileName: req.originalname }),
// //   };
// //   //console.log("params", params);

// //   res.json({
// //     msg: "test_test_test13-2 ok",
// //   });
// // });

// app.post("/test_test_test13", async function (req, res) {
//   // const params = {
//   //   FunctionName: "ANOTHER_LAMBDA_NAME",
//   //   Payload: JSON.stringify({ fileName: req.originalname }),
//   // };
//   // //console.log("params", params);

//   res.json({
//     msg: "test_test_test13-2 ok",
//   });
// });

app.get("/", function (req, res) {
  var test = "123";

  //console.log("log -> -------------------");
  //console.log("log -> ~ test", test);
  //console.log("log -> -------------------");

  res.send("check22");
});

module.exports = app;
