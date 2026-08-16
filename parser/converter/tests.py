import os
from django.test import TestCase, Client
from converter.services.parser import parse_835_to_mir
from converter.services.validator import PyX12Validator, EDI835Validator

SAMPLE_ONE_LINE = "ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260813*1200*U*00501*000000001*0*P*:~GS*HP*SENDER*RECEIVER*20260813*1200*1*X*005010X221A1~ST*835*0001~BPR*I*150.00*C*CHK************20260813~TRN*1*123456789*1999999999~N1*PR*PAYER NAME~N1*PE*PROVIDER NAME*XX*1234567890~LX*1~CLP*CLAIM1001*1*200.00*150.00*50.00*MC*REF12345~NM1*QC*1*SMITH*JOHN*M~NM1*IL*1*SMITH*JOHN****MI*SUB123456~REF*1L*GRP999~DTM*036*19850101~DTM*050*20260801~SVC*HC:99213*200.00*150.00**1~DTM*472*20260805~CAS*CO*45*50.00~SE*16*0001~GE*1*1~IEA*1*000000001~"

SAMPLE_CRLF = SAMPLE_ONE_LINE.replace("~", "~\r\n")

class PyX12ValidatorTestSuite(TestCase):

    def setUp(self):
        self.validator = PyX12Validator()

    # TEST 1: Valid/accepted 835 fixture
    def test_1_valid_835(self):
        res = self.validator.validate(SAMPLE_ONE_LINE)
        self.assertEqual(res['total_segments'], 20)
        self.assertEqual(res['claims'], 1)
        self.assertEqual(res['validator_engine'], "Validated using PyX12")

    # TEST 2: Malformed ISA
    def test_2_malformed_isa(self):
        malformed_isa = "ISA*00*BAD_ISA_HEADER~ST*835*0001~SE*2*0001~"
        res = self.validator.validate(malformed_isa)
        self.assertFalse(res['valid'])
        self.assertGreater(len(res['errors']), 0)

    # TEST 3: Wrong SE segment count
    def test_3_wrong_se_segment_count(self):
        bad_se = SAMPLE_ONE_LINE.replace("SE*16*0001~", "SE*99*0001~")
        res = self.validator.validate(bad_se)
        self.assertFalse(res['valid'])
        self.assertTrue(any("SE" in e['segment'] or "SE" in e['code'] or "segment" in e['message'].lower() for e in res['errors']))

    # TEST 4: Missing SE
    def test_4_missing_se(self):
        missing_se = SAMPLE_ONE_LINE.replace("SE*16*0001~", "")
        res = self.validator.validate(missing_se)
        self.assertFalse(res['valid'])

    # TEST 5: Wrong GS/GE relationship
    def test_5_wrong_gs_ge_relationship(self):
        bad_ge = SAMPLE_ONE_LINE.replace("GE*1*1~", "GE*1*999~")
        res = self.validator.validate(bad_ge)
        self.assertFalse(res['valid'])

    # TEST 6: Wrong ISA/IEA relationship
    def test_6_wrong_isa_iea_relationship(self):
        bad_iea = SAMPLE_ONE_LINE.replace("IEA*1*000000001~", "IEA*1*999999999~")
        res = self.validator.validate(bad_iea)
        self.assertFalse(res['valid'])

    # TEST 7: Non-835 X12
    def test_7_non_835_x12(self):
        edi_270 = SAMPLE_ONE_LINE.replace("ST*835*0001~", "ST*270*0001~")
        res = self.validator.validate(edi_270)
        self.assertFalse(res['valid'])
        self.assertEqual(res['errors'][0]['code'], 'NON_835_TRANSACTION')

    # TEST 8: One-line X12 file with ~ delimiters
    def test_8_one_line_x12(self):
        res = self.validator.validate(SAMPLE_ONE_LINE)
        self.assertEqual(res['total_segments'], 20)
        self.assertEqual(res['claims'], 1)

    # TEST 9: Same EDI with CRLF line endings
    def test_9_crlf_line_endings(self):
        res = self.validator.validate(SAMPLE_CRLF)
        self.assertEqual(res['total_segments'], 20)
        self.assertEqual(res['claims'], 1)

    # TEST 10: Large 1009-transaction 835
    def test_10_large_1009_transaction_835(self):
        if os.path.exists("CLM_PAYP_20260807_070315(1).x12"):
            with open("CLM_PAYP_20260807_070315(1).x12", "r", encoding="utf-8") as f:
                large_edi = f.read()
            res = self.validator.validate(large_edi)
            self.assertEqual(res['total_segments'], 16148)
            self.assertEqual(res['claims'], 1009)
            # Ensure no false SE_COUNT_MISMATCH errors from physical line formatting
            se_errors = [e for e in res['errors'] if "SE" in e.get("code", "") and "count" in e.get("message", "").lower()]
            self.assertEqual(len(se_errors), 0)


class ViewsTestCase(TestCase):

    def setUp(self):
        self.client = Client()

    def test_index_view(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_api_convert(self):
        response = self.client.post('/api/convert/', data={'edi_text': SAMPLE_ONE_LINE})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])

    def test_api_validate_endpoint(self):
        response = self.client.post('/api/validate/', data={'edi_text': SAMPLE_ONE_LINE})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['report']['total_segments'], 20)
