from datetime import timedelta, datetime

from django.db.models import F, Count, Sum, Q
from django.db.models.functions import Round
from django.shortcuts import render
from django.utils import timezone
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from knowhow.models import Knowhow, KnowhowFile, KnowhowScrap
from lecture.models import Lecture, LecturePlaceFile, LectureReview, LectureScrap, LecturePlant
from post.models import Post, PostScrap
from trade.models import Trade, TradeFile, TradeScrap


class SearchView(View):
    def get(self, request):
        member = request.session['member']
        profile = request.session['member_files'][0]
        search_data = request.GET['query']

        if member is not None:
            profile = request.session['member_files'][0]

        knowhow_condition = Q(knowhow_title__contains=search_data)
        knowhows_queryset = Knowhow.objects.filter(knowhow_condition)
        knowhows = knowhows_queryset.order_by('knowhow_count') \
                       .annotate(member_profile=F('member__memberprofile__file_url'),
                                 member_name=F('member__member_name')) \
                       .values('member_profile', 'member_name', 'id', 'knowhowscrap__status', 'knowhow_title')[:8]

        knowhow_count = knowhows_queryset.count()

        for knowhow in knowhows:
            knowhow_file = KnowhowFile.objects.filter(knowhow_id=knowhow['id']).values('file_url').first()
            knowhow['knowhow_file_url'] = knowhow_file['file_url']

        trade_condition = Q(trade_title__contains=search_data)
        trades_queryset = Trade.enabled_objects.filter(trade_condition)
        trades = trades_queryset.order_by('-id') \
                     .annotate(trade_category_name=F('trade_category__category_name')) \
                     .values('id', 'trade_title', 'trade_content', 'trade_price', 'trade_category_name',
                             'tradescrap__status')[:10]
        trade_count = trades_queryset.count()

        for trade in trades:
            trade_file = TradeFile.objects.filter(trade_id=trade['id']).values('file_url').first()
            trade['trade_file_url'] = trade_file['file_url']

        post_condition = Q(post_title__contains=search_data)
        posts = Post.objects.filter(post_condition).order_by(
            'post_count').values()[:8]

        lecture_condition = Q(lecture_title__contains=search_data)
        lectures_queryset = Lecture.enabled_objects.filter(lecture_condition)
        lectures = lectures_queryset.annotate(review_count=Count('lecturereview'), lecture_rating=Round(
            Sum('lecturereview__review_rating') / Count('lecturereview'), 1)) \
                       .order_by('-id').values('id', 'lecture_title', 'lecture_content', 'lecturescrap__status',
                                               'lecture_rating', 'review_count')[:8]
        lecture_count = lectures_queryset.count()

        for lecture in lectures:
            lecture_file = LecturePlaceFile.objects.filter(lecture_id=lecture['id']).values('file_url').first()
            lecture['lecture_file_url'] = lecture_file['file_url']
            tags = LecturePlant.objects.filter(lecture_id=lecture['id']).values('plant_name')
            lecture_file['lecture_tags'] = [tag['plant_name'] for tag in tags]
            if lecture['lecture_rating'] is None:
                lecture['lecture_rating'] = 0

        count = {
            'knowhow_count': knowhow_count,
            'trade_count': trade_count,
            'lecture_count': lecture_count
        }

        context = {
            'memberProfile': profile['file_url'],
            'count': count,
            'knowhows': knowhows,
            'lectures': lectures,
            'trades': trades,
            # 'posts': posts[:8],
        }
        return render(request, 'main/search.html', context)


class MainView(View):
    def get(self, request):
        member = request.session['member']
        profile = request.session['member_files'][0]
        if member is not None:
            profile = request.session['member_files'][0]

        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        # created_date__range = (start_of_week, end_of_week)
        knowhows = Knowhow.objects.filter().order_by(
            'knowhow_count').annotate(member_profile=F('member__memberprofile__file_url'),
                                      member_name=F('member__member_name')).values('member_profile', 'member_name',
                                                                                   'id', 'knowhowscrap__status',
                                                                                   'knowhow_title')[:10]
        for knowhow in knowhows:
            knowhow_file = KnowhowFile.objects.filter(knowhow_id=knowhow['id']).values('file_url').first()
            knowhow['knowhow_file_url'] = knowhow_file['file_url']
        # 데이터가 너무 적어 하루단위를 일단 일주일 단위로 바꿈
        # start_of_day = datetime(today.year, today.month, today.day, 0, 0, 0)
        # end_of_day = datetime(today.year, today.month, today.day, 23, 59, 59)
        trades = Trade.enabled_objects.filter() \
                     .order_by('-id') \
                     .annotate(trade_category_name=F('trade_category__category_name')) \
                     .values('id', 'trade_title', 'trade_content', 'trade_price', \
                             'trade_category_name', 'tradescrap__status')[:6]
        for trade in trades:
            trade_file = TradeFile.objects.filter(trade_id=trade['id']).values('file_url').first()
            trade['trade_file_url'] = trade_file['file_url']
        posts = Post.objects.filter().order_by(
            'post_count').values()[:3]

        lectures = Lecture.enabled_objects.filter().order_by(
            '-id').values('id', 'lecture_title', 'lecture_content', 'lecturescrap__status')[:4]
        for lecture in lectures:
            lecture_file = LecturePlaceFile.objects.filter(lecture_id=lecture['id']).values('file_url').first()
            lecture['lecture_file_url'] = lecture_file['file_url']
        # 데이터가 너무 적어 하루단위를 일단 일주일 단위로 바꿈
        lecture_reviews = LectureReview.objects.filter().order_by(
            '-id').annotate(lecture_title=F('lecture__lecture_title'), ).values('id', 'lecture_title', 'review_content',
                                                                                'lecture_id')[:3]
        for lecture_review in lecture_reviews:
            lecture_review_file = Lecture.objects.filter(id=lecture_review['lecture_id']).values(
                'lectureplacefile__file_url').first()
            lecture_review['lecture_file_url'] = lecture_review_file['lectureplacefile__file_url']

        context = {
            'memberProfile': profile['file_url'],
            'knowhows': knowhows,
            'lectures': lectures,
            'trades': trades,
            'lectureReviews': lecture_reviews,
            # 'posts': posts,
        }
        return render(request, 'main/main.html', context)


class BestLectureCategoryAPI(APIView):
    def post(self, request):
        data = request.data
        catagory = data['category']
        if not catagory == '전체':
            condition = Q(lectureplant__plant_name=catagory)
        else:
            condition = Q()
        best_lectures = Lecture.enabled_objects.filter(condition) \
                            .annotate(review_count=Count('lecturereview'),
                                      lecture_rating=Round(Sum('lecturereview__review_rating') / Count('lecturereview'),
                                                           1)) \
                            .order_by('-id') \
                            .values('id', 'lecture_title', 'lecture_content', 'lecturescrap__status', 'review_count',
                                    'lecture_rating', 'lecture_price')[:3]

        for best_lecture in best_lectures:
            lecture_file = LecturePlaceFile.objects.filter(lecture_id=best_lecture['id']).values('file_url').first()
            best_lecture['lecture_file_url'] = lecture_file['file_url']
            tags = LecturePlant.objects.filter(lecture_id=best_lecture['id']).values('plant_name')
            best_lecture['lecture_tags'] = [tag['plant_name'] for tag in tags]
            if best_lecture['lecture_rating'] is None:
                best_lecture['lecture_rating'] = 0

        return Response(best_lectures)


class KnowhowScrapAPI(APIView):
    def patch(self, request):
        data = request.data
        data = {
            'knowhow_id': data['knowhow_id'],
            'member_id': request.session['member']['id']
        }

        knowhow_scrap, created = KnowhowScrap.objects.get_or_create(knowhow_id=data['knowhow_id'],
                                                                    member_id=data['member_id'])
        if not created:
            is_scrap = False if knowhow_scrap.status else True
            knowhow_scrap.status = is_scrap
            knowhow_scrap.save()

        return Response('success')


class TradeScrapAPI(APIView):
    def patch(self, request):
        data = request.data
        data = {
            'trade_id': data['trade_id'],
            'member_id': request.session['member']['id']
        }

        trade_scrap, created = TradeScrap.objects.get_or_create(trade_id=data['trade_id'], member_id=data['member_id'])
        if not created:
            is_scrap = False if trade_scrap.status else True
            print(is_scrap)
            trade_scrap.status = is_scrap
            trade_scrap.save()

        return Response('success')


class LectureScrapAPI(APIView):
    def patch(self, request):
        data = request.data
        data = {
            'lecture_id': data['lecture_id'],
            'member_id': request.session['member']['id']
        }
        lecture_scrap, created = LectureScrap.objects.get_or_create(lecture_id=data['lecture_id'],
                                                                    member_id=data['member_id'])
        if not created:
            is_scrap = False if lecture_scrap.status else True
            lecture_scrap.status = is_scrap
            lecture_scrap.save()

        return Response('success')


class PostScrapAPI(APIView):
    def patch(self, request):
        data = request.data
        data = {
            'post_id': data['post_id'],
            'member_id': request.session['member']['id']
        }

        post_scrap, created = PostScrap.objects.get_or_create(post_id=data['post_id'], member_id=data['member_id'])
        if not created:
            is_scrap = False if post_scrap.status else True
            post_scrap.status = is_scrap
            post_scrap.save()

        return Response('success')
